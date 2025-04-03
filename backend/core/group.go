package core

import (
	"fmt"
	"net/http"
	"social/pkg/utils"
	"strconv"
)

type GroupsInfo struct {
	ID           int    `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	CreatorEmail string `json:"creator_email"`
	CreatedAt    string `json:"created_at"`
	MemberCount  int    `json:"member_count"`
	UserStatus   string `json:"status"`
}

type Group struct {
	ID          int      `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	CreatorID   int      `json:"creatorId"`
	CreatorName string   `json:"creatorName"`
	CreatedAt   string   `json:"createdAt"`
	Members     []Member `json:"members"`
}

type Member struct {
	UserID   int    `json:"userId"`
	UserName string `json:"userName"`
	Status   string `json:"status"`
}

// GET /groups
func (a *API) HandleGetGroups(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	query := `
        SELECT 
            g.id, 
            g.title, 
            g.description, 
            u.email AS creator_email,
            g.created_at,
            COUNT(gm.user_id) AS member_count,
            COALESCE(um.status, 'none') AS user_status
        FROM groups g
        JOIN users u ON g.creator_id = u.id
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'accepted'
        LEFT JOIN group_members um ON g.id = um.group_id AND um.user_id = ?
        GROUP BY g.id
        ORDER BY g.created_at DESC
    `

	rows, err := a.ReadAll(query, userId)
	if err != nil {
		fmt.Println("failed to get groups:", err)
		utils.RespondWithJSON(
			w,
			http.StatusInternalServerError,
			map[string]string{"error": "Failed to retrieve groups"},
		)
		return
	}
	defer rows.Close()

	var groups []GroupsInfo
	for rows.Next() {
		var group GroupsInfo
		err := rows.Scan(
			&group.ID,
			&group.Title,
			&group.Description,
			&group.CreatorEmail,
			&group.CreatedAt,
			&group.MemberCount,
			&group.UserStatus,
		)
		if err != nil {
			fmt.Println("error processing groups:", err)
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"error": "Error processing groups"},
			)
			return
		}
		groups = append(groups, group)
	}

	if err = rows.Err(); err != nil {
		fmt.Println("error finalizing group list:", err)
		utils.RespondWithJSON(
			w,
			http.StatusInternalServerError,
			map[string]string{"error": "Error finalizing group list"},
		)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, groups)
}

func (a *API) HandleCreateGroup(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	groupName := r.PostFormValue("group_name")
	description := r.PostFormValue("description")

	groupId, err := a.Create(
		`INSERT INTO groups (title, description, creator_id) VALUES (?, ?, ?)`,
		groupName, description, userId,
	)
	if err != nil {
		fmt.Println("failed to create group:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create group"})
		return
	}

	_, err = a.Create(
		`INSERT INTO group_members (group_id, user_id, invitation_type, status) VALUES (?, ?, 'invite', 'accepted')`,
		groupId, userId,
	)
	if err != nil {
		fmt.Println("failed to add creator to group:", err)
		utils.RespondWithJSON(
			w,
			http.StatusInternalServerError,
			map[string]string{"error": "Failed to add creator to group"},
		)
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, map[string]string{"success": "Group created"})
}

func (a *API) HandlePutGroup(w http.ResponseWriter, r *http.Request) {
	action := r.PostFormValue("action")
	userId := r.Context().Value("userID").(int)

	switch action {
	case "invite":
		fmt.Println("invite")
		a.HandleInviteAction(w, r, userId)
	case "request":
		fmt.Println("request")
		a.HandleRequestAction(w, r, userId)
	case "accept", "reject":
		fmt.Println("accept/reject")
		a.HandleAcceptRejectAction(w, r, userId)
	case "accept/invite", "reject/invite":
		fmt.Println("accept/invite or reject/invite")
	default:
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid action"})
	}
}

func (a *API) HandleInviteAction(w http.ResponseWriter, r *http.Request, userId int) {
	groupId := r.PostFormValue("group_id")
	targetUserEmail := r.PostFormValue("user_id")

	var targetUserID int
	err := a.Read(`SELECT id FROM users WHERE email = ?`, targetUserEmail).Scan(&targetUserID)
	if err != nil {
		fmt.Println("user not found:", err)
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	var inviterStatus string
	err = a.Read(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, userId).
		Scan(&inviterStatus)
	if err != nil || inviterStatus != "accepted" {
		fmt.Println("unauthorized invite attempt:", err)
		utils.RespondWithJSON(w, http.StatusForbidden, map[string]string{"error": "Not authorized to invite"})
		return
	}

	var existingStatus string
	err = a.Read(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, targetUserID).
		Scan(&existingStatus)
	if err == nil {
		switch existingStatus {
		case "accepted":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "User already in group"})
			return
		case "pending":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Invitation already pending"})
			return
		case "declined":
			_, err = a.Update(
				`UPDATE group_members SET status = 'pending', invitation_type = 'invite' WHERE group_id = ? AND user_id = ?`,
				groupId,
				targetUserID,
			)
		}
	} else {
		_, err = a.Create(
			`INSERT INTO group_members (group_id, user_id, invitation_type, status) VALUES (?, ?, 'invite', 'pending')`,
			groupId, targetUserID,
		)
	}

	if err != nil {
		fmt.Println("failed to send invitation:", err)
		utils.RespondWithJSON(
			w,
			http.StatusInternalServerError,
			map[string]string{"error": "Failed to send invitation"},
		)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Invitation sent"})
}

func (a *API) HandleRequestAction(w http.ResponseWriter, r *http.Request, userId int) {
	groupId := r.PostFormValue("group_id")

	var existingStatus string
	err := a.Read(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, userId).
		Scan(&existingStatus)
	if err == nil {
		switch existingStatus {
		case "accepted":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Already in group"})
			return
		case "pending":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Request already pending"})
			return
		case "declined":
			_, err = a.Update(
				`UPDATE group_members SET status = 'pending', invitation_type = 'request' WHERE group_id = ? AND user_id = ?`,
				groupId,
				userId,
			)
		}
	} else {
		_, err = a.Create(
			`INSERT INTO group_members (group_id, user_id, invitation_type, status) VALUES (?, ?, 'request', 'pending')`,
			groupId, userId,
		)
	}

	if err != nil {
		fmt.Println("failed to create request:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create request"})
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Join request sent"})
}

func (a *API) HandleAcceptRejectAction(w http.ResponseWriter, r *http.Request, userId int) {
	groupId := r.PostFormValue("group_id")
	targetUserID := r.PostFormValue("user_id")
	action := r.PostFormValue("action")
	if targetUserID == "" {
		targetUserID = strconv.Itoa(userId)
	}

	var invitationType string
	var status string
	err := a.Read(
		`SELECT invitation_type, status FROM group_members WHERE group_id = ? AND user_id = ?`,
		groupId, targetUserID,
	).Scan(&invitationType, &status)
	if err != nil {
		fmt.Println("no invitation found:", err)
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "No invitation found"})
		return
	}

	if status != "pending" {
		utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Invitation not pending"})
		return
	}

	switch invitationType {
	case "invite":
		tarUserID, _ := strconv.Atoi(targetUserID)
		if userId != tarUserID {
			fmt.Printf("unauthorized response attempt: user %d != target %d\n", userId, tarUserID)
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Not authorized to respond"})
			return
		}
	case "request":
		var creatorId int
		err := a.Read(`SELECT creator_id FROM groups WHERE id = ?`, groupId).Scan(&creatorId)
		if err != nil || creatorId != userId {
			fmt.Println("unauthorized request response:", err)
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

	_, err = a.Update(
		`UPDATE group_members SET status = ? WHERE group_id = ? AND user_id = ?`,
		newStatus, groupId, targetUserID,
	)
	if err != nil {
		fmt.Println("status update failed:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update status"})
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Invitation " + newStatus})
}
