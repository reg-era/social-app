package core

import (
	"fmt"
	"net/http"
	"social/pkg/utils"
	"strconv"
)

func (a *API) HandleGroupDetails(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	switch r.Method {
	case http.MethodGet:
		groupIDStr := r.URL.Query().Get("group_id")
		groupID, err := strconv.Atoi(groupIDStr)
		if err != nil || groupID <= 0 {
			fmt.Println(err)

			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid group ID"})
			return
		}
		var memberStatus string
		err = a.Read(`SELECT status FROM group_members 
			WHERE group_id = ? AND user_id = ?`,
			groupID, userId).Scan(&memberStatus)
		if err != nil || memberStatus != "accepted" {
			utils.RespondWithJSON(w, http.StatusForbidden,
				map[string]string{"error": "Not a group member"})
			return
		}


		var group Group

		err = a.Read(`
			SELECT g.id, g.title, g.description, g.creator_id, g.created_at, u.firstname  
			FROM groups g
			JOIN users u ON g.creator_id = u.id
			WHERE g.id = ?`, groupID).Scan(&group.ID, &group.Title, &group.Description, &group.CreatorID, &group.CreatedAt, &group.CreatorName)

		if err != nil {
			fmt.Println(err)

			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch group detail"})
			return
		}
		membersData, err := a.ReadAll(`
			SELECT u.id, u.firstname,  gm.status
			FROM group_members gm
			JOIN users u ON gm.user_id = u.id
			WHERE gm.group_id = ?`, groupID)
		if err != nil {
			fmt.Println(err)

			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch group members"})
			return
		}
		defer membersData.Close()

		var members []Member
		for membersData.Next() {
			var member Member
			if err := membersData.Scan(&member.UserID, &member.UserName, &member.Status); err != nil {
				fmt.Println(err)

				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to scan member data"})
				return
			}
			members = append(members, member)
		}

		group.Members = members
		utils.RespondWithJSON(w, http.StatusOK, group)

	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
	}
}

func (a *API) HandleGroupInvitations(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	if r.Method != http.MethodGet {
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	rows, err := a.ReadAll(`
        SELECT 
            g.id,
            g.title,
            g.description,
            gm.status,
            gm.invitation_type,
            g.created_at
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        WHERE gm.user_id = ? AND gm.status = 'pending' AND gm.invitation_type = 'invite'
    `, userId)

	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch invitations"})
		return
	}
	defer rows.Close()

	type Invitation struct {
		GroupID     int    `json:"groupId"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Status      string `json:"status"`
		Type        string `json:"type"`
		CreatedAt   string `json:"createdAt"`
	}

	var invitations []Invitation
	for rows.Next() {
		var inv Invitation
		err := rows.Scan(&inv.GroupID, &inv.Title, &inv.Description, &inv.Status, &inv.Type, &inv.CreatedAt)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Error processing invitations"})
			return
		}
		invitations = append(invitations, inv)
	}

	utils.RespondWithJSON(w, http.StatusOK, invitations)
}
