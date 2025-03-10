package core

import (
	"net/http"

	"social/pkg/utils"
)

type Msg struct {
	Content  string `json:"content"`
	Sender   int    `json:"sender"`
	Receiver int    `json:"receiver"`
}

func (api *API) HandleChat(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	switch r.Method {
	case http.MethodGet:
		target := r.URL.Query().Get("target")
		subTarget := r.URL.Query().Get("user")

		nich := map[bool]struct {
			query  string
			params []any
		}{true: {
			query: `SELECT sender_id, receiver_id, content FROM messages
			WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
			params: []any{userId, subTarget},
		}, false: {
			query:  ``,
			params: []any{userId},
		}}[(target == "user" && subTarget != "")]

		var conversation []Msg
		data, err := api.ReadAll(nich.query, nich.params...)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Status Internal Server Error",
			})
			return
		}

		for data.Next() {
			var msg Msg
			if err := data.Scan(&msg.Sender, &msg.Receiver, &msg.Content); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"faild": "Status Internal Server Error",
				})
				return
			}
			conversation = append(conversation, msg)
		}

		utils.RespondWithJSON(w, http.StatusOK, conversation)

	case http.MethodPost:
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
	}
}
