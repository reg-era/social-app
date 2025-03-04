package core

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type ChatHub struct {
	connections map[int][]*websocket.Conn
	mu          sync.RWMutex
}

func NewChatHub() *ChatHub {
	return &ChatHub{
		connections: make(map[int][]*websocket.Conn),
	}
}

var ch = NewChatHub()

func HandleChat(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
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

	ch.mu.Lock()
	if connections, ok := ch.connections[userId]; ok {
		ch.connections[userId] = append(connections, conn)
	} else {
		ch.connections[userId] = []*websocket.Conn{conn}
	}
	ch.mu.Unlock()

	for {
		fmt.Println("user in hub: ", len(ch.connections))
		fmt.Println("user connections: ", len(ch.connections[userId]))
		var message struct {
			Content  string `json:"content"`
			Receiver int    `json:"receiver"`
		}

		if err := conn.ReadJSON(&message); err != nil {
			ch.mu.Lock()
			fmt.Printf("user disconnect:%d message: %v\n", userId, err)

			if len(ch.connections[userId]) <= 1 {
				delete(ch.connections, userId)
			} else {
				for i, c := range ch.connections[userId] {
					if c == conn {
						ch.connections[userId] = append(ch.connections[userId][:i], ch.connections[userId][i+1:]...)
						break
					}
				}
			}
			ch.mu.Unlock()
			return
		}

		fmt.Println("Received message:", message)

		ch.mu.RLock()
		if connections, ok := ch.connections[message.Receiver]; ok {
			for _, window := range connections {
				if err := window.WriteJSON(struct {
					Content string `json:"content"`
					Sender  int    `json:"sender"`
				}{Content: message.Content, Sender: userId}); err != nil {
					fmt.Println("Error sending message:", err)
				}
			}
		} else {
			fmt.Println("Receiver user not found:", message.Receiver)
		}
		ch.mu.RUnlock()
	}
}
