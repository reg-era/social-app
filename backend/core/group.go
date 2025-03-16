package core

import (
	"net/http"
	"social/pkg/utils"
)

type GroupInfo struct {
	ID           int    `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	CreatorEmail string `json:"creator_email"`
	CreatedAt    string `json:"created_at"`
	MemberCount  int    `json:"member_count"`
}

func (a *API) HandleGroup(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	switch r.Method {
	case http.MethodGet:
		query := `
            SELECT 
                g.id, 
                g.title, 
                g.description, 
                u.email AS creator_email,
                g.created_at,
                COUNT(gm.user_id) AS member_count
            FROM groups g
            JOIN users u ON g.creator_id = u.id
            LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'accepted'
            GROUP BY g.id
            ORDER BY g.created_at DESC
        `

		rows, err := a.ReadAll(query)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError,
				map[string]string{"error": "Failed to retrieve groups"})
			return
		}
		defer rows.Close()

		var groups []GroupInfo
		for rows.Next() {
			var group GroupInfo
			err := rows.Scan(
				&group.ID,
				&group.Title,
				&group.Description,
				&group.CreatorEmail,
				&group.CreatedAt,
				&group.MemberCount,
			)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError,
					map[string]string{"error": "Error processing groups"})
				return
			}
			groups = append(groups, group)
		}

		if err = rows.Err(); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError,
				map[string]string{"error": "Error finalizing group list"})
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, groups)

	case http.MethodPost:
		groupName := r.PostFormValue("group_name")
		description := r.PostFormValue("description")

		groupId, err := a.Create(`INSERT INTO groups (title, description, creator_id) VALUES (?, ?, ?)`, groupName, description, userId)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create group"})
			return
		}

		_, err = a.Create(`INSERT INTO group_members (group_id, user_id, invitation_type, status) VALUES (?, ?, 'invite', 'accepted')`, groupId, userId)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to add creator to group"})
			return
		}

		utils.RespondWithJSON(w, http.StatusCreated, map[string]string{"success": "Group created"})

	case http.MethodPut:
		groupId := r.PostFormValue("group_id")
		action := r.PostFormValue("action")

		switch action {
		case "invite":
			targetUserEmail := r.PostFormValue("user_id")
			var targetUserID int
			err := a.Read(`SELECT id FROM users WHERE email = ?`, targetUserEmail).Scan(&targetUserID)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
				return
			}

			var inviterStatus string
			err = a.Read(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, userId).Scan(&inviterStatus)
			if err != nil || inviterStatus != "accepted" {
				utils.RespondWithJSON(w, http.StatusForbidden, map[string]string{"error": "Not authorized to invite"})
				return
			}

			var existingStatus string
			err = a.Read(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, targetUserID).Scan(&existingStatus)
			if err == nil {
				switch existingStatus {
				case "accepted":
					utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "User already in group"})
					return
				case "pending":
					utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Invitation already pending"})
					return
				case "declined":
					_, err = a.Update(`UPDATE group_members SET status = 'pending', invitation_type = 'invite' 
								WHERE group_id = ? AND user_id = ?`, groupId, targetUserID)
				}
			} else {
				_, err = a.Create(`INSERT INTO group_members 
							(group_id, user_id, invitation_type, status) 
							VALUES (?, ?, 'invite', 'pending')`, groupId, targetUserID)
			}

			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to send invitation"})
				return
			}
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Invitation sent"})

		case "request":
			var existingStatus string
			err := a.Read(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, userId).Scan(&existingStatus)
			if err == nil {
				switch existingStatus {
				case "accepted":
					utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Already in group"})
					return
				case "pending":
					utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Request already pending"})
					return
				case "declined":
					_, err = a.Update(`UPDATE group_members SET status = 'pending', invitation_type = 'request' 
						WHERE group_id = ? AND user_id = ?`, groupId, userId)
				}
			} else {
				_, err = a.Create(`INSERT INTO group_members 
					(group_id, user_id, invitation_type, status) 
					VALUES (?, ?, 'request', 'pending')`, groupId, userId)
			}

			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create request"})
				return
			}
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Join request sent"})
		case "accept", "reject":
			targetUserEmail := r.PostFormValue("user_id")
			var targetUserID int
			err := a.Read(`SELECT id FROM users WHERE email = ?`, targetUserEmail).Scan(&targetUserID)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
				return
			}

			var invitationType string
			var status string
			err = a.Read(`SELECT invitation_type, status FROM group_members 
						WHERE group_id = ? AND user_id = ?`, groupId, targetUserID).Scan(&invitationType, &status)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "No invitation found"})
				return
			}

			if status != "pending" {
				utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Invitation not pending"})
				return
			}

			switch invitationType {
			case "invite":
				if userId != targetUserID {
					utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Not authorized to respond"})
					return
				}
			case "request":
				var creatorId int
				err := a.Read(`SELECT creator_id FROM groups WHERE id = ?`, groupId).Scan(&creatorId)
				if err != nil || creatorId != userId {
					utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Not group creator"})
					return
				}
			default:
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid invitation type"})
				return
			}

			newStatus := "accepted"
			if action == "reject" {
				newStatus = "declined"
			}

			_, err = a.Update(`UPDATE group_members SET status = ? 
						WHERE group_id = ? AND user_id = ?`, newStatus, groupId, targetUserID)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update status"})
				return
			}

			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Invitation " + newStatus})

		default:
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid action"})
		}

	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
	}
}
