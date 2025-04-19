package core

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"social/pkg/utils"
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
        SELECT g.id, g.title, g.description, u.email AS creator_email, g.created_at, COUNT(gm.user_id) AS member_count, COALESCE(um.status, 'none') AS user_status
        FROM groups g
        JOIN users u ON g.creator_id = u.id
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'accepted'
        LEFT JOIN group_members um ON g.id = um.group_id AND um.user_id = ?
        GROUP BY g.id
        ORDER BY g.created_at DESC`

	rows, err := a.ReadAll(query, userId)
	if err != nil {
		fmt.Println("failed to get groups:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve groups"})
		return
	}
	defer rows.Close()

	var groups []GroupsInfo
	for rows.Next() {
		var group GroupsInfo
		err := rows.Scan(&group.ID, &group.Title, &group.Description, &group.CreatorEmail, &group.CreatedAt, &group.MemberCount, &group.UserStatus)
		if err != nil {
			fmt.Println("error processing groups:", err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Error processing groups"})
			return
		}
		groups = append(groups, group)
	}

	if err = rows.Err(); err != nil {
		fmt.Println("error finalizing group list:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Error finalizing group list"})
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
	fmt.Println("action:", action)
	switch action {
	case "invite":
		fmt.Println("invite")
		a.HandleInviteAction(w, r, userId)
	case "request":
		fmt.Println("request")
		a.HandleRequestAction(w, r, userId)
	case "accept", "reject":
		fmt.Println("accept/reject admin")
		a.HandleAcceptRejectAction(w, r, userId)
	default:
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid action"})
	}
}

func (a *API) HandleInviteAction(w http.ResponseWriter, r *http.Request, userId int) {
	groupId := r.PostFormValue("group_id")
	fmt.Println("0")
	targetUserEmail := r.PostFormValue("user_id")

	tx, err := a.DB.Begin()
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	var targetUserID int
	err = tx.QueryRow(`SELECT id FROM users WHERE email = ?`, targetUserEmail).Scan(&targetUserID)
	if err != nil {
		fmt.Println("user not found:", err)
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	var inviterStatus string
	err = tx.QueryRow(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, userId).Scan(&inviterStatus)
	if err != nil || inviterStatus != "accepted" {
		fmt.Println("unauthorized invite attempt:", err)
		utils.RespondWithJSON(w, http.StatusForbidden, map[string]string{"error": "Not authorized to invite"})
		return
	}

	var existingStatus string
	var groupTitle string

	err = tx.QueryRow(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, targetUserID).Scan(&existingStatus)
	if err == nil {
		switch existingStatus {
		case "accepted":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "User already in group"})
			return
		case "pending":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Invitation already pending"})
			return
		case "declined":
			_, err = tx.Exec(
				`UPDATE group_members SET status = 'pending', invitation_type = 'invite' WHERE group_id = ? AND user_id = ?`,
				groupId,
				targetUserID,
			)
		}
	} else {
		_, err = tx.Exec(
			`INSERT INTO group_members (group_id, user_id, invitation_type, status) VALUES (?, ?, 'invite', 'pending')`,
			groupId, targetUserID,
		)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create group"})
			return
		}
		err = tx.QueryRow("SELECT title FROM groups WHERE id = ?", groupId).Scan(&groupTitle)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get group details"})
			return
		}
	}

	if err != nil {
		fmt.Println("failed to send invitation:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to send invitation"})
		return
	}

	notification := &Note{
		Type:     "group_invite",
		Sender:   userId,
		Receiver: targetUserID,
		Content:  fmt.Sprintf("You have been invited to join group '%s'", groupTitle),
		GroupID:  groupId,
	}

	if err := a.AddNotificationTx(notification, tx); err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to send notification"})
		return
	}

	if err := tx.Commit(); err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Transaction failed"})
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Invitation sent"})
}

func (a *API) HandleRequestAction(w http.ResponseWriter, r *http.Request, userId int) {
	groupId := r.PostFormValue("group_id")
	fmt.Println("1")
	tx, err := a.DB.Begin()
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	var existingStatus string
	err = tx.QueryRow(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`, groupId, userId).Scan(&existingStatus)

	if err == nil {
		switch existingStatus {
		case "accepted":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Already in group"})
			return
		case "pending":
			utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "Request already pending"})
			return
		case "declined":
			if _, err = tx.Exec(
				`UPDATE group_members SET status = 'pending', invitation_type = 'request' WHERE group_id = ? AND user_id = ?`,
				groupId,
				userId,
			); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
				return
			}
		}
	} else if err == sql.ErrNoRows {
		if _, err = tx.Exec(
			`INSERT INTO group_members (group_id, user_id, invitation_type, status) VALUES (?, ?, 'request', 'pending')`,
			groupId, userId,
		); err != nil {
			fmt.Println("exec :", err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
			return
		}
	} else {
		fmt.Println("query failed:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})
		return
	}

	// Get user's email for notification content
	var userEmail string
	err = tx.QueryRow(`SELECT email FROM users WHERE id = ?`, userId).Scan(&userEmail)
	if err != nil {
		fmt.Println("failed to get user email:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})
		return
	}

	// Get group creator ID and group title
	var creatorId int
	var groupTitle string
	err = tx.QueryRow(`SELECT creator_id, title FROM groups WHERE id = ?`, groupId).Scan(&creatorId, &groupTitle)
	if err != nil {
		fmt.Println("failed to get group details:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})
		return
	}

	// Create notification for group creator
	notification := &Note{
		Type:     "group_request",
		Sender:   userId,
		Receiver: creatorId,
		Content:  fmt.Sprintf("%s wants to join your group '%s'", userEmail, groupTitle),
		GroupID:  groupId,
	}

	if err := a.AddNotificationTx(notification, tx); err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to send notification"})
		return
	}

	if err := tx.Commit(); err != nil {
		fmt.Println("transaction commit failed:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Transaction failed"})
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"success": "Join request sent"})
}

func (a *API) HandleAcceptRejectAction(w http.ResponseWriter, r *http.Request, userId int) {
	groupId := r.PostFormValue("group_id")
	targetUserID := r.PostFormValue("user_id")
	action := r.PostFormValue("action")

	if action == "approve" {
		action = "accept"
	} else if action == "deny" {
		action = "reject"
	}

	if targetUserID == "" {
		targetUserID = strconv.Itoa(userId)
	}

	tx, err := a.DB.Begin()
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	var invitationType string
	var status string
	err = tx.QueryRow(
		`SELECT invitation_type, status FROM group_members WHERE group_id = ? AND user_id = ?`,
		groupId, targetUserID,
	).Scan(&invitationType, &status)
	fmt.Println("these are the group id and user id ", groupId, userId)
	if err != nil || status != "pending" {
		fmt.Println("failed to find pending request:", err)
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "No pending request found"})
		return
	}

	// Check authorization
	if invitationType == "request" {
		var creatorId int
		err := tx.QueryRow(`SELECT creator_id FROM groups WHERE id = ?`, groupId).Scan(&creatorId)
		if err != nil || creatorId != userId {
			fmt.Println("unauthorized request handling:", err)
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Only group creator can handle join requests"})
			return
		}
	} else if invitationType == "invite" {
		targetIDInt, _ := strconv.Atoi(targetUserID)
		if userId != targetIDInt {
			fmt.Println("unauthorized invite handling:", err)
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Not authorized to respond"})
			return
		}
	}

	newStatus := "accepted"
	if action == "reject" {
		newStatus = "declined"
	}

	// Update status
	_, err = tx.Exec(
		`UPDATE group_members SET status = ? WHERE group_id = ? AND user_id = ?`,
		newStatus, groupId, targetUserID,
	)
	if err != nil {
		fmt.Println("failed to update status:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update status"})
		return
	}

	// Delete related notification
	_, err = tx.Exec(
		`DELETE FROM notifications 
        WHERE (type = 'group_invite' OR type = 'group_request')
        AND group_id = ? AND (user_id = ? OR related_id = ?)`,
		groupId, targetUserID, targetUserID,
	)
	if err != nil {
		fmt.Println("failed to delete notification:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to cleanup notification"})
		return
	}

	if err := tx.Commit(); err != nil {
		fmt.Println("transaction commit failed:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Transaction failed"})
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Request processed successfully"})
}
