package core

import (
	"database/sql"
	"fmt"
	"net/http"
	"sync"

	"social/pkg/utils"
)

var dbMutex sync.Mutex

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
		SELECT id, related_id, type, content, 
		CASE 
			WHEN type LIKE 'group_%' THEN group_id 
			ELSE '' 
		END as group_id 
		FROM notifications 
		WHERE user_id = ?`, userId)
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

func (api *API) AddNotification(notif *Note) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	var exists int
	query := `
	SELECT 1 FROM notifications 
	WHERE user_id = ? AND related_id = ? AND type = ? AND group_id = ? LIMIT 1`
	err := api.Read(query, notif.Receiver, notif.Sender, notif.Type, notif.GroupID).Scan(&exists)
	if err == nil {
		return nil
	} else if err != sql.ErrNoRows {
		fmt.Println("error on checking notif existence: ", err)
		return fmt.Errorf("operation failed")
	}

	_, err = api.Create(`
	INSERT INTO notifications (user_id, related_id, type, content, group_id)
	VALUES (?, ?, ?, ?, ?)`,
		notif.Receiver, notif.Sender, notif.Type, notif.Content, notif.GroupID)
	if err != nil {
		fmt.Println("error on adding notif: ", err)
		return fmt.Errorf("operation failed")
	}

	api.HUB.Notification <- notif

	return nil
}

func (api *API) SendGroupInviteNotification(inviterId int, invitedUserId int, groupId string, groupTitle string) error {
	notification := &Note{
		Type:     "group_invite",
		Sender:   inviterId,
		Receiver: invitedUserId,
		Content:  fmt.Sprintf("You have been invited to join group '%s'", groupTitle),
		GroupID:  groupId,
	}
	if err := api.AddNotification(notification); err != nil {
		return fmt.Errorf("failed to send group invitation notification: %v", err)
	}

	return nil
}

func (a *API) sendEventNotifications(groupID string, eventTitle string, creatorId int) error {
	rows, err := a.ReadAll(`
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

		notification := &Note{
			Type:     "event_created",
			Sender:   creatorId,
			Receiver: memberId,
			Content:  fmt.Sprintf("A new event '%s' has been created", eventTitle),
			GroupID:  groupID,
		}

		if err := a.AddNotification(notification); err != nil {
			fmt.Printf("failed to send notification to user %d: %v\n", memberId, err)
		}
	}

	return nil
}
