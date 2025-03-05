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
		_, err :=a.Create(`INSERT INTO groups (group_name, group_creator) VALUES (?)`, group_name, userId)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"failed": "Status Internal Server Error",
			})
			return
		}else {
			utils.RespondWithJSON(w, http.StatusCreated, map[string]string{
				"valid": "Group Created",
			})	
		}


	}
}
