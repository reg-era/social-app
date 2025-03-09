package core

import (
	"encoding/json"
	"net/http"

	"social/pkg/utils"
)

func (a *API) HandleFollow(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	var follow struct {
		Following_id int `json:"following"`
	}

	if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
		utils.RespondWithJSON(
			w,
			http.StatusInternalServerError,
			map[string]string{"error": "status internal server error"},
		)
	}
	_, err := a.Create(
		"INSERT INTO followers (follower_id, following_id) VALUES (?,?)",
		userId,
		follow.Following_id,
	)
	if err != nil {
		utils.RespondWithJSON(
			w,
			http.StatusInternalServerError,
			map[string]string{"error": "internal server error"},
		)
	}
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"error": "user followed"})
}
