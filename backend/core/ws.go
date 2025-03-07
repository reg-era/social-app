package core

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"sync"

	"social/pkg/utils"

	"github.com/gorilla/websocket"
)

type NetworkHub struct {
	Message      chan *Message
	Notification chan any
	Network      map[int][]*websocket.Conn
	Mutex        sync.RWMutex
}

type WSMessage struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

func NewWebSocketHub() *NetworkHub {
	return &NetworkHub{
		Message:      make(chan *Message),
		Notification: make(chan any),
		Network:      make(map[int][]*websocket.Conn),
	}
}

func (net *NetworkHub) RegisterUser(userId int, conn *websocket.Conn) {
	net.Mutex.Lock()
	defer net.Mutex.Unlock()

	net.Network[userId] = append(net.Network[userId], conn)
}

func (net *NetworkHub) UnregisterUser(userId int, conn *websocket.Conn) {
	net.Mutex.Lock()
	defer net.Mutex.Unlock()

	conns := net.Network[userId]
	for i, c := range conns {
		if c == conn {
			net.Network[userId] = slices.Delete(net.Network[userId], i, i+1)
			break
		}
	}
}

func (net *NetworkHub) RunHubListner() {
	for {
		select {
		case newMsg := <-net.Message:
			fmt.Println(newMsg)
			net.Mutex.RLock()
			if connections, ok := net.Network[newMsg.Receiver]; ok {
				for _, window := range connections {
					if err := window.WriteJSON(newMsg); err != nil {
						fmt.Println("Error sending message:", err)
					}
				}
			} else {
				fmt.Println("Receiver user not found:", newMsg.Receiver)
			}
			net.Mutex.RUnlock()
		case newNotif := <-net.Notification:
			fmt.Println(newNotif)
		}
	}
}

func (api *API) WebSocketConnect(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	fmt.Println("upcoming connection: ", userId)

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError,
			map[string]string{"error": "Status Internal Server Error"},
		)
		return
	}
	defer conn.Close()

	api.HUB.RegisterUser(userId, conn)
	defer api.HUB.UnregisterUser(userId, conn)

	for {
		var upComingMsg WSMessage

		if err := conn.ReadJSON(&upComingMsg); err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseAbnormalClosure) {
				fmt.Println("Connection closed by client:", err)
				break
			}
			fmt.Println("Error reading message:", err)
			continue
		}

		dataByte, err := json.Marshal(upComingMsg.Data)
		if err != nil {
			fmt.Println("Error marshalling data:", err)
			continue
		}

		switch upComingMsg.Type {
		case "message":
			var newMessage Message
			if err := json.Unmarshal(dataByte, &newMessage); err != nil {
				fmt.Println("Error unmarshalling message:", err)
				continue
			}
			fmt.Println("Received message:", newMessage)
			newMessage.Sender = userId
			if _, err := api.Create(`INSERT INTO messages(content, sender_id, receiver_id) VALUES(?, ?, ?)`,
				newMessage.Content, newMessage.Sender, newMessage.Receiver); err != nil {
				fmt.Println("add to db:", err)
				continue
			}
			api.HUB.Message <- &newMessage
		default:
			fmt.Println("Unsupported message type:", upComingMsg.Type)
			if err := conn.WriteJSON(map[string]string{"error": "Unsupported message type"}); err != nil {
				fmt.Println("Error sending response:", err)
			}
		}
	}
}
