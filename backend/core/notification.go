package core

import (
	"net/http"

	"social/pkg/utils"
)

type Note struct {
	Type     string `json:"type"`     // follow_request, group_invite, group_request, event_created, post_comment
	Sender   int    `json:"sender"`   // user or group id
	Receiver int    `json:"receiver"` // userID
	Content  string `json:"content"`  // msg should be displayed
}

func (a *API) HandleNotif(w http.ResponseWriter, r *http.Request) {
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"msg": "stiilll fixing"})
}
