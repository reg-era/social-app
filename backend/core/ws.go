package core

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"sync"

	"social/pkg/utils"

	"github.com/gorilla/websocket"
)

type NetworkHub struct {
	Message      chan *Msg
	Notification chan *Note
	Network      map[int][]*websocket.Conn
	Mutex        sync.RWMutex
}

type WSMessage struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

func NewWebSocketHub() *NetworkHub {
	return &NetworkHub{
		Message:      make(chan *Msg),
		Notification: make(chan *Note),
		Network:      make(map[int][]*websocket.Conn),
	}
}

func (net *NetworkHub) RegisterUser(userId int, conn *websocket.Conn) {
	net.Mutex.Lock()
	defer net.Mutex.Unlock()

	net.Network[userId] = append(net.Network[userId], conn)
	fmt.Println(net.Network)
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
	fmt.Println(net.Network)
}

func (net *NetworkHub) RunHubListner() {
	for {
		fmt.Println(net.Network)
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
	session := r.URL.Query().Get("auth")
	var userID int
	err := api.Read(`SELECT user_id FROM sessions WHERE session_hash = ?`, session).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid session"})
		} else {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Invalid operation"})
		}
		return
	}


	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
		return
	}
	defer conn.Close()

	api.HUB.RegisterUser(userID, conn)
	defer api.HUB.UnregisterUser(userID, conn)

	for {
		var upComingMsg WSMessage

		if err := conn.ReadJSON(&upComingMsg); err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure, websocket.CloseAbnormalClosure) {
				fmt.Println("Connection closed by client:", err)
				break
			}
			fmt.Println("Error reading message:", err)
			break
		}

		dataByte, err := json.Marshal(upComingMsg.Data)
		if err != nil {
			fmt.Println("Error marshalling data:", err)
			continue
		}

		var newMessage Msg
		if err := json.Unmarshal(dataByte, &newMessage); err != nil {
			fmt.Println("Error unmarshalling message:", err)
			continue
		}

		fmt.Printf("Received message type: %v\nwith data: %v\n", upComingMsg.Type, newMessage)
	}
}
