package core

import (
	"net/http"

	"social/pkg/utils"
)

func (a *API) HandleSearch(w http.ResponseWriter, r *http.Request) {
	target := r.URL.Query().Get("target")
	if target != "" {
		data, err := a.ReadAll(`
		SELECT  email, firstname, lastname, birthdate, avatarUrl, nickname, about, is_public
		FROM users WHERE firstname LIKE $1 OR lastname LIKE $1 OR email LIKE $1 ;`, target+"%")
		if err != nil {
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
