package core

import (
	"net/http"
	"strconv"

	"social/pkg/utils"
)

type Message struct {
	Content  string `json:"content"`
	Sender   int    `json:"sender"`
	Receiver int    `json:"receiver"`
}

func (api *API) HandleChat(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	if r.Method != http.MethodGet {
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{
			"error": "Status Method Not Allowed",
		})
		return
	}

	param := r.URL.Query().Get("conv")
	receiver, err := strconv.Atoi(param)
	if param == "" || err != nil {
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Status Bad Request",
		})
		return
	}

	var conversation []Message
	data, err := api.ReadAll(`
	SELECT sender_id, receiver_id, content FROM messages
	WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
	`, userId, receiver)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Status Internal Server Error",
		})
		return
	}

	for data.Next() {
		var msg Message
		if err := data.Scan(&msg.Sender, &msg.Receiver, &msg.Content); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"faild": "Status Internal Server Error",
			})
			return
		}
		conversation = append(conversation, msg)
	}

	utils.RespondWithJSON(w, http.StatusOK, conversation)
}
