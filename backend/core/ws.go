package core

import (
	"fmt"
	"slices"
	"sync"

	"github.com/gorilla/websocket"
)

type NetworkHub struct {
	Message      chan *Message
	Notification chan any
	Network      map[int][]*websocket.Conn
	Mutex        sync.RWMutex
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

	if _, ok := net.Network[userId]; ok {
		net.Network[userId] = append(net.Network[userId], conn)
	} else {
		net.Network[userId] = []*websocket.Conn{conn}
	}
}

func (net *NetworkHub) RemoveUser(userId int, conn *websocket.Conn) {
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
					if err := window.WriteJSON(struct {
						Content string `json:"content"`
						Sender  int    `json:"sender"`
					}{Content: newMsg.Content, Sender: newMsg.Sender}); err != nil {
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
