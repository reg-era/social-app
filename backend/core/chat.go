package core

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Message struct {
	Sender   int
	Content  string `json:"content"`
	Receiver int    `json:"receiver"`
}

func (api *API) HandleChat(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	fmt.Println("upcoming connection: ", userId)

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}
	defer conn.Close()

	api.HUB.RegisterUser(userId, conn)
	for {
		var message Message
		if err := conn.ReadJSON(&message); err != nil {
			api.HUB.RemoveUser(userId, conn)
			return
		}

		fmt.Println("Received message:", message)
		message.Sender = userId
		api.HUB.Message <- &message
	}
}
