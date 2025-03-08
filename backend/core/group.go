package core

import (
	"net/http"
	"social/pkg/utils"
)

func (a *API) HandleGroup(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	switch r.Method {
	case http.MethodPost:
		group_name := r.PostFormValue("group_name")
		description := r.PostFormValue("description")
		_, err := a.Create(`INSERT INTO groups (title, creator_id, description) VALUES (?, ?, ?)`, group_name, userId, description)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"failed": "Status Internal Server Error",
			})
			return
		} else {
			utils.RespondWithJSON(w, http.StatusCreated, map[string]string{
				"valid": "Group Created",
			})
		}
	case http.MethodGet : 
	
	default:
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
			"error": "bad request",
		})
	}
}

// TODO !!!!!!!!
// func (a *API) HandleGroupJoin(w http.ResponseWriter, r *http.Request) {
// 	userId := r.Context().Value("userID").(int)
// 	r.URL.Query().Get("")
// 	switch r.Method {
// 	case http.MethodPost:

// 	case http.MethodGet:
// 	default:
// 		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
// 			"error": "Bad request",
// 		})
// 		return

// 	}
// }
