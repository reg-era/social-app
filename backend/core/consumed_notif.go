package core

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/pkg/utils"
)

func (a *API) Consumed(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	if r.Method != http.MethodPut {
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	var consumed struct {
		NotificationID int `json:"notification_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&consumed); err != nil {
		utils.RespondWithJSON(
			w,
			http.StatusInternalServerError,
			map[string]string{"error": "status internal server error"},
		)
		return
	}
	fmt.Printf("Processing consumed notification ID: %d for user ID: %d\n", consumed.NotificationID, userID)

	var notifType string
	if err := a.Read(`SELECT type FROM notifications WHERE id = ? AND user_id = ?`,
		consumed.NotificationID, userID).Scan(&notifType); err != nil {
		utils.RespondWithJSON(w, http.StatusNotFound,
			map[string]string{"error": "Notification not found"})
		return
	}

	switch notifType {
	case "follow_request", "group_invite", "group_request":
		if _, err := a.Create(`DELETE FROM notifications WHERE id = ? AND user_id = ?`,
			consumed.NotificationID, userID); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError,
				map[string]string{"error": "Failed to delete notification"})
			return
		}
		utils.RespondWithJSON(w, http.StatusOK,
			map[string]string{"message": "Notification processed"})
	default:
		utils.RespondWithJSON(w, http.StatusBadRequest,
			map[string]string{"error": "Invalid notification type"})
	}
}
