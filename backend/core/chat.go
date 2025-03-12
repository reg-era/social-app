package core

import (
	"fmt"
	"net/http"
	"strconv"

	"social/pkg/utils"
)

type Msg struct {
	Content       string `json:"content"`
	Sender        int    `json:"sender"`
	Receiver      int    `json:"receiver"`
	EmailSender   string `json:"email_sender"`
	EmailReceiver string `json:"email_receiver"`
}

func (api *API) HandleChat(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	switch r.Method {
	case http.MethodGet:
		target := r.URL.Query().Get("target")
		param := r.URL.Query().Get("page")
		page := 0
		if param != "" {
			var err error
			if page, err = strconv.Atoi(param); err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Status Bad Request"})
				return
			}
		}
		if target == "conv" {
			subTarget := r.URL.Query().Get("user")
			conversation := []Msg{}
			data, err := api.ReadAll(`
				SELECT  m.sender_id,  m.receiver_id, m.content, u1.email AS sender_email,  u2.email AS receiver_email
				FROM messages m
				JOIN users u1 ON m.sender_id = u1.id
				JOIN users u2 ON m.receiver_id = u2.id
				WHERE (m.sender_id = $1 AND u2.email = $2 )
				OR (u1.email = $2 AND m.receiver_id = $1 )
				ORDER BY m.created_at DESC
				LIMIT 5 OFFSET (5 * $3);`, userId, subTarget, page)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
				return
			}
			defer data.Close()

			for data.Next() {
				var msg Msg
				if err := data.Scan(&msg.Sender, &msg.Receiver, &msg.Content, &msg.EmailSender, &msg.EmailReceiver); err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
					return
				}
				conversation = append(conversation, msg)
			}

			utils.RespondWithJSON(w, http.StatusOK, conversation)
		} else {
			contact := []User{}
			data, err := api.ReadAll(``, userId)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
				return
			}
			defer data.Close()

			for data.Next() {
				var user User
				if err := data.Scan(); err != nil {
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
					return
				}
				contact = append(contact, user)
			}

			utils.RespondWithJSON(w, http.StatusOK, contact)
		}
	case http.MethodPost:
		
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
	}
}
