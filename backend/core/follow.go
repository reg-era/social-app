package core

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/pkg/utils"
)

func (a *API) HandleFollow(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	var follow struct {
		Following_id int `json:"following"`
	}
	switch r.Method {
	case http.MethodPost:
		if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}
		db_following_check := a.Read(`SELECT id FROM users WHERE id =?`, follow.Following_id)
		if err := db_following_check.Scan(); err != nil {
			utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{
				"error": "user does not exist",
			})
		}

		exists := false
		err := a.Read(`SELECT EXISTS(
		SELECT 1 FROM follows
		WHERE FOLLOWER_id =? AND following_id =?
		)`, userId, follow.Following_id).Scan(&exists)
		if err != nil {
			fmt.Println(err)

			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Database error",
			})
		}
		if exists {
			_, err = a.Create(`DELETE FROM follows
			WHERE follower_id =? AND following_id =?`, userId, follow.Following_id)

			if err != nil {
			fmt.Println(err)

				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Unfollow error",
				})
				return
			}
			utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{
				"valid": "User unfollowed",
			})
			return
		}
		public := false
		err = a.Read(`SELECT is_public FROM users WHERE id = ?`, follow.Following_id).Scan(&public)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
				"error": "Invalid request format",
			})
			return
		}
		if public {
			_, err = a.Create("INSERT INTO follows (follower_id, following_id) VALUES (?,?)", userId, follow.Following_id)
			if err != nil {
			fmt.Println(err)

				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
				return
			}
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"valid": "user followed"})
		} else {
			_, err = a.Create(`INSERT INTO follow_requests (follower_id, following_id)
		VALUES(?,?)`, userId, follow.Following_id)
			if err != nil {
			fmt.Println(err)

				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Could not follow user",
				})
				return
			}
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{
				"valid": "Follow request sent to User",
			})

		}

	case http.MethodGet:

		// wwhen sending get method specify in the query what do you want followers or following
		
		follow_type := r.URL.Query().Get("FollowType")

		var query string
		switch follow_type {
		case "followers":
			query = `
				SELECT u.id, u.username, u.avatar, u.is_public 
				FROM users u 
				JOIN follows f ON u.id = f.follower_id 
				WHERE f.following_id = ?`
		case "following":
			query = `
				SELECT u.id, u.username, u.avatar, u.is_public 
				FROM users u 
				JOIN follows f ON u.id = f.following_id 
				WHERE f.follower_id = ?`
		default:
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
				"error": "FollowType is not correct",
			})
			return
		}

		rows, err := a.DB.Query(query, userId)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Database error",
			})
			return
		}
		defer rows.Close()

		var users []map[string]any
		for rows.Next() {
			var user struct {
				ID       int    `json:"id"`
				Username string `json:"username"`
				Avatar   string `json:"avatar"`
				IsPublic bool   `json:"is_public"`
			}

			if err := rows.Scan(&user.ID, &user.Username, &user.Avatar, &user.IsPublic); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Database error",
				})
				return
			}

			users = append(users, map[string]any{
				"id":        user.ID,
				"username":  user.Username,
				"avatar":    user.Avatar,
				"is_public": user.IsPublic,
			})
		}

		utils.RespondWithJSON(w, http.StatusOK, map[string]any{
			"users": users,
		})
	default:
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Bad request",
		})
		return
	}

}

func (a *API) HandleFollowRequest(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	switch r.Method {
	case http.MethodGet:

		rows, err := a.ReadAll(`
            SELECT fr.follower_id, u.username, u.avatar, fr.created_at 
            FROM follow_requests fr
            JOIN users u ON fr.follower_id = u.id
            WHERE fr.following_id = ?
            ORDER BY fr.created_at DESC`, userId)

		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Failed to fetch follow requests",
			})
			return
		}
		defer rows.Close()

		var requests []map[string]any
		for rows.Next() {
			var request struct {
				FollowerID int    `json:"follower_id"`
				Username   string `json:"username"`
				Avatar     string `json:"avatar"`
				CreatedAt  string `json:"created_at"`
			}

			if err := rows.Scan(&request.FollowerID, &request.Username,
				&request.Avatar, &request.CreatedAt); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Database error",
				})
				return
			}

			requests = append(requests, map[string]any{
				"follower_id": request.FollowerID,
				"username":    request.Username,
				"avatar":      request.Avatar,
				"created_at":  request.CreatedAt,
			})
		}

		utils.RespondWithJSON(w, http.StatusOK, map[string]any{
			"requests": requests,
		})

	case http.MethodPut:
		var response struct {
			FollowerID int    `json:"follower_id"`
			Action     string `json:"action"` 
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
                VALUES (?, ?)`, response.FollowerID, userId)

			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Failed to accept follow request",
				})
				return
			}
		}

		_, err := a.Create(`
            DELETE FROM follow_requests 
            WHERE follower_id = ? AND following_id = ?`,
			response.FollowerID, userId)

		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Failed to process follow request",
			})
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, map[string]string{
			"valid": "Follow request " + response.Action,
		})

	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{
			"error": "Method not allowed",
		})
	}
}
