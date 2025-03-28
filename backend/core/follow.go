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
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}

		exists := false
		err := a.Read(`SELECT EXISTS(
			SELECT 1 FROM follows
			WHERE FOLLOWER_id =? AND following_id = (SELECT id FROM users WHERE email = ?) )`,
			userId, userAction.Email).Scan(&exists)
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}

		if exists {
			_, err = a.Create(`DELETE FROM follows
			WHERE follower_id =? AND following_id = (SELECT id FROM users WHERE email = ?)`, userId, userAction.Email)
			if err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Unfollow error"})
				return
			}
			utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{"valid": "User unfollowed"})
			return
		}

		public := false
		err = a.Read(`SELECT is_public FROM users WHERE id = (SELECT id FROM users WHERE email = ?)`, userAction.Email).Scan(&public)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request format"})
			return
		}

		if public {
			_, err = a.Create("INSERT INTO follows (follower_id, following_id) VALUES ( ? , (SELECT id FROM users WHERE email = ?) )", userId, userAction.Email)
			if err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
				return
			}

		} else {
			_, err = a.Create(`INSERT INTO follow_requests (follower_id, following_id)
		VALUES( ? , (SELECT id FROM users WHERE email = ?) )`, userId, userAction.Email)
			if err != nil {
				fmt.Println(err)

				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Could not follow user",
				})
				return
			}
		}

		utils.RespondWithJSON(w, http.StatusOK, map[string]string{"valid": "Follow request sent to User"})
	case http.MethodPut:
		var response struct {
			UserEmail string `json:"email"`
			Action    string `json:"action"`
		}

		if err := json.NewDecoder(r.Body).Decode(&response); err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
				"error": "Invalid request format",
			})
			return
		}

		if response.Action == "accept" {
			_, err := a.Create(`
                INSERT INTO follows (follower_id, following_id) 
                VALUES ( (SELECT id FROM users WHERE email = ?) , ? )`, response.UserEmail, userId)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Failed to accept follow request",
				})
				return
			}
		} else if response.Action == "decline" {
			_, err := a.Create(`
                DELETE FROM follow_requests 
                WHERE follower_id = (SELECT id FROM users WHERE email = ?) AND following_id = ?`,
				response.UserEmail, userId)
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

		utils.RespondWithJSON(w, http.StatusOK, map[string]string{"valid": "Follow request " + response.Action})
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
		return
  }
}