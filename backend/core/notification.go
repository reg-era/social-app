package core

import (
	"fmt"
	"net/http"

	"social/pkg/utils"
)

type Note struct {
	Type     string `json:"type"`     // follow_request, group_invite, group_request, event_created, post_comment
	Sender   int    `json:"sender"`   // user or group id
	Receiver int    `json:"receiver"` // userID
	Content  string `json:"content"`  // msg should be displayed
}

func (api *API) HandleNotif(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	data, err := api.ReadAll(`SELECT type, content FROM notifications WHERE related_id = ?`, userId)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
		return
	}
	defer data.Close()

	response := []Note{}
	for data.Next() {
		var notif Note
		if err := data.Scan(&notif.Type, &notif.Content); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
			return
		}
		response = append(response, notif)
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"msg": "stiilll fixing"})
}

func (api *API) AddNotification(notif *Note) error {
	_, err := api.Create(`
	INSERT INTO notifications (user_id, related_id, type, content)
	VALUES (?, ?, ?, ?)`, notif.Sender, notif.Receiver, notif.Type, notif.Content)
	if err != nil {
		fmt.Println("error on adding notif: ", err)
		return fmt.Errorf("operation faild")
	}
	return nil
}
