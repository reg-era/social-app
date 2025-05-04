package core

import (
	"encoding/json"
	"fmt"
	"net/http"

	"social/pkg/utils"
)

func (a *API) HandleFollow(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	var userAction User
	switch r.Method {
	case http.MethodPost:
		if err := json.NewDecoder(r.Body).Decode(&userAction); err != nil {
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"error": "status internal server error"},
			)
			return
		}

		tx, err := a.DB.Begin()
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to start transaction"})
			return
		}
		defer tx.Rollback()

		var targetUserID int
		tx.QueryRow("SELECT id FROM users WHERE email = ?", userAction.Email).Scan(&targetUserID)

		var exists bool
		err = tx.QueryRow(`SELECT EXISTS(
			SELECT 1 FROM follows
			WHERE follower_id = ? AND following_id = ? )`,
			userId, targetUserID).Scan(&exists)
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}

		fmt.Println(exists, userId, targetUserID)
		if exists {
			fmt.Println("fired delete 1", exists)
			_, err = tx.Exec(`DELETE FROM follows
			WHERE following_id = ? AND follower_id = ?`, targetUserID, userId) // Corrected parameter order
			if err != nil {
				fmt.Println("Error deleting follow relationship:", err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Unfollow error"})
				return
			}

			// Commit the transaction after deletion
			if err = tx.Commit(); err != nil {
				fmt.Println("Failed to commit transaction after deletion:", err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not complete unfollow action"})
				return
			}

			utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{"state": "unfollowed"})
			return
		}

		var public bool
		err = tx.QueryRow(`SELECT is_public FROM users WHERE id = ?`, targetUserID).Scan(&public)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request format"})
			return
		}

		if public {
			_, err = tx.Exec(
				"INSERT INTO follows (follower_id, following_id) VALUES ( ? , ? )",
				userId,
				targetUserID,
			)
			if err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
				return
			}

			// Commit the transaction
			if err = tx.Commit(); err != nil {
				fmt.Println("Failed to commit transaction:", err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not complete follow action"})
				return
			}

			fmt.Println("Followed user successfully")
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"state": "followed"})
		} else {
			var requested int
			err := tx.QueryRow(`SELECT COUNT(*) FROM follow_requests WHERE follower_id = ? AND following_id = ?`, userId, targetUserID).Scan(&requested)
			if err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not check follow request"})
				return
			}

			if requested > 0 {
				_, err = tx.Exec(`DELETE FROM follow_requests WHERE follower_id = ? AND following_id = ?`, userId, targetUserID)
				if err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not remove follow request"})
					return
				}

				utils.RespondWithJSON(w, http.StatusOK, map[string]string{"state": "unfollowed"})
				return
			} else {
				result, err := tx.Exec(`INSERT INTO follow_requests (follower_id, following_id)
				VALUES( ? , ? )`, userId, targetUserID)
				if err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not follow user"})
					return
				}

				requestId, err := result.LastInsertId()
				if err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not get request ID"})
					return
				}

				var receiver int
				var actionerEmail string
				if err := tx.QueryRow(`SELECT following_id, u.email FROM follow_requests f
				JOIN users u ON f.follower_id = u.id WHERE f.id = ?`, requestId).Scan(&receiver, &actionerEmail); err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not follow user"})
					return
				}

				// Add notification before committing transaction
				err = a.AddNotificationTx(&Note{
					Type:     "follow_request",
					Sender:   userId,
					Receiver: receiver,
					Content:  fmt.Sprintf("%s Want to follow you", actionerEmail),
				}, tx)
				if err != nil {
					fmt.Println("Failed to add notification:", err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not create notification"})
					return
				}

				// Commit the transaction
				if err = tx.Commit(); err != nil {
					fmt.Println("Failed to commit transaction:", err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not complete follow request"})
					return
				}

				utils.RespondWithJSON(w, http.StatusOK, map[string]string{"state": "pending"})
			}
		}

	case http.MethodPut:
		var response struct {
			NotefId    int    `json:"noteId"`
			UserAction int    `json:"actioner"`
			Action     string `json:"action"`
		}

		if err := json.NewDecoder(r.Body).Decode(&response); err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
				"error": "Invalid request format",
			})
			return
		}

		if response.Action == "accept" {
			tx, err := a.DB.Begin()
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed"})
				return
			}
			defer tx.Rollback()

			_, err = tx.Exec(
				`INSERT INTO follows (follower_id, following_id)  VALUES ($1, $2)`,
				response.UserAction,
				userId,
			)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed"})
				return
			}

			_, err = tx.Exec(
				`DELETE FROM follow_requests WHERE follower_id = $1 AND following_id = $2`,
				response.UserAction,
				userId,
			)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed"})
				return
			}

			err = tx.Commit()
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed"})
				return
			}

		} else if response.Action == "decline" {
			_, err := a.Create(`
                DELETE FROM follow_requests 
                WHERE follower_id = ? AND following_id = ?`,
				response.UserAction, userId)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Failed to process follow request",
				})
				return
			}
		} else {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Bad request"})
			return
		}

		if _, err := a.Create(`DELETE FROM notifications WHERE id = ? ;`, response.NotefId); err != nil {
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"error": "Failed to remove note"},
			)
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, map[string]string{"valid": "Follow request " + response.Action})
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
		return
	}
}
