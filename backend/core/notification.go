package core

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"social/pkg/utils"
)

type Note struct {
	Id       int
	Type     string `json:"type"`     // follow_request, group_invite, group_request, event_created, post_comment
	Sender   int    `json:"sender"`   // user or group id
	Receiver int    `json:"receiver"` // userID
	Content  string `json:"content"`  // msg should be displayed
	GroupID  string `json:"group_id"` // group id for group notifs
}

func (api *API) HandleNotif(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	data, err := api.ReadAll(`
		SELECT n.id, n.related_id, n.type, n.content, 
		CASE 
			WHEN n.type LIKE 'group_%' THEN n.group_id 
			ELSE '' 
		END as group_id 
		FROM notifications n
		LEFT JOIN groups g ON n.group_id = g.id
		WHERE n.user_id = ? AND (
			n.type != 'group_request' OR 
			(n.type = 'group_request' AND g.creator_id = ?)
		)`, userId, userId)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError,
			map[string]string{"error": "Status Internal Server Error"})
		return
	}
	defer data.Close()

	response := []Note{}
	for data.Next() {
		var notif Note
		notif.Receiver = userId
		if err := data.Scan(&notif.Id, &notif.Sender, &notif.Type, &notif.Content, &notif.GroupID); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError,
				map[string]string{"error": "Status Internal Server Error"})
			return
		}
		response = append(response, notif)
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

func (api *API) AddNotificationTx(notif *Note, tx *sql.Tx) error {
	fmt.Printf("Attempting to add notification: %+v\n", notif)

	result, err := tx.Exec(`
	INSERT INTO notifications (user_id, related_id, type, content, group_id, created_at)
	VALUES (?, ?, ?, ? , ? , ?)`,
		notif.Receiver, // user_id
		notif.Sender,   // related_id
		notif.Type,     // type
		notif.Content,  // content
		notif.GroupID,  // group_id
		time.Now().UTC())
	if err != nil {
		fmt.Printf("Error inserting notification: %v\n", err)
		return fmt.Errorf("operation failed")
	}

	id, _ := result.LastInsertId()
	fmt.Printf("Successfully inserted notification with ID: %d\n", id)
	return nil
}

func (a *API) sendEventNotifications(groupID string, eventTitle string, creatorId int, tx *sql.Tx) error {
	rows, err := tx.Query(`
        SELECT user_id 
        FROM group_members 
        WHERE group_id = ? 
        AND status = 'accepted' 
        AND user_id != ?`,
		groupID, creatorId)
	if err != nil {
		return fmt.Errorf("failed to get group members: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var memberId int
		if err := rows.Scan(&memberId); err != nil {
			continue
		}

		notif := &Note{
			Receiver: memberId,
			Sender:   creatorId,
			Type:     "event_created",
			Content:  fmt.Sprintf("A new event '%s' has been created", eventTitle),
			GroupID:  groupID,
		}

		if err := a.AddNotificationTx(notif, tx); err != nil {
			fmt.Printf("Failed to create notification for user %d: %v\n", memberId, err)
			return err
		}
	}

	return nil
}
