package core

import (
	"net/http"

	"social/pkg/utils"
)

func (a *API) HandleVisibilityChange(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	if r.Method != http.MethodPost {
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{
			"error": "Method not allowed",
		})
		return
	}

	// getting the current vis
	var currentVisibility int
	err := a.Read("SELECT is_public FROM users WHERE id = ?", userId).Scan(&currentVisibility)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to get user status",
		})
		return
	}

	// change the vis form private to public || public to private
	newVisibility := 0
	if currentVisibility == 0 {
		newVisibility = 1
	}

	_, err = a.Update("UPDATE users SET is_public = ? WHERE id = ?", newVisibility, userId)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to update visibility status",
		})
		return
	}

	// if the user changed to private we delete the follow req / to public we accept all the pending follow req automatically
	if newVisibility == 1 {
		tx, err := a.DB.Begin()
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
			return
		}
		defer tx.Rollback()

		rows, err := tx.Query("SELECT follower_id FROM follow_requests WHERE following_id = ? AND status = 'pending'", userId)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch pending requests"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var followerId int
			if err := rows.Scan(&followerId); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to process follow requests"})
				return
			}

			_, err = tx.Exec("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", followerId, userId)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to add followers"})
				return
			}
		}

		var reqID, relatedID int
		if err := tx.QueryRow(`SELECT id, follower_id FROM follow_requests WHERE following_id = ? AND status = 'pending';`, userId).Scan(&reqID, &relatedID); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed fetch data"})
			return
		}

		_, err = tx.Exec("DELETE FROM follow_requests WHERE id = ? ", reqID)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Failed to clean up follow requests",
			})
			return
		}

		_, err = tx.Exec("DELETE FROM notifications WHERE user_id = ? AND related_id = ? AND type = 'follow_request';", userId, relatedID)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Failed to clean up follow requests",
			})
			return
		}

		err = tx.Commit()
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Failed to commit transaction",
			})
			return
		}

	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]any{
		"status":   "success",
		"isPublic": newVisibility == 1,
	})
}
