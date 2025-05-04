package core

import (
	"net/http"

	"social/pkg/utils"
)

func (a *API) HandleSearch(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	target := r.URL.Query().Get("target")
	nich := r.URL.Query().Get("nich")
	if target != "" {
		if r.URL.Query().Get("isowner") != "" {
			exists := false
			err := a.Read(`SELECT EXISTS(
				SELECT 1 FROM users
				WHERE id = ? AND email = ? )`,
				userId, target).Scan(&exists)
			if err != nil || exists {
				utils.RespondWithJSON(w, http.StatusConflict, map[string]string{"error": "this is owner"})
			} else {
				utils.RespondWithJSON(w, http.StatusOK, nil)
			}
			return
		}
		query := ""
		var values []any
		if nich == "close" {
			query = `SELECT  email, firstname, lastname, birthdate, avatarUrl, nickname, about, is_public
			FROM users
			JOIN follows ON follower_id = id 
			WHERE following_id =$1 ;`
			values = []any{userId}
		} else {
			query = `SELECT email, firstname, lastname, birthdate, avatarUrl, nickname, about, is_public
					FROM users
					WHERE (firstname LIKE $1 OR lastname LIKE $1 OR email LIKE $1) AND id != $2;`
			values = []any{target + "%", userId}
		}

		data, err := a.ReadAll(query, values...)
		if err != nil {
			return
		}
		defer data.Close()

		response := []User{}
		for data.Next() {
			var user User
			if err := data.Scan(&user.Email, &user.FirstName, &user.LastName, &user.DateOfBirth, &user.AvatarUrl, &user.Nickname, &user.AboutMe, &user.IsPublic); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
				return
			}
			response = append(response, user)
		}
		utils.RespondWithJSON(w, http.StatusOK, response)
	}
}
