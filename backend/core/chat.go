package core

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"social/pkg/utils"
)

type Msg struct {
	Content       string `json:"content"`
	Sender        int    `json:"sender"`
	Receiver      int    `json:"receiver"`
	EmailSender   string `json:"email_sender"`
	EmailReceiver string `json:"email_receiver"`
	Group_id      int    `json:"group_id"`
	Group_members []int  `json:"group_members"`
	CreateAt      string `json:"create_at"`
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
		if strings.HasPrefix(target, "group_") {
			group_id, err := strconv.Atoi(strings.TrimPrefix(target, "group_"))
			if err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Status Bad Request"})
				return
			}
			conversation := []Msg{}
			data, err := api.ReadAll(`
				SELECT  m.sender_id, m.content, m.created_at, u1.email AS sender_email
				FROM messages m
				JOIN users u1 ON m.sender_id = u1.id
				WHERE (m.group_id = ? )
				ORDER BY m.created_at DESC
				LIMIT 5 OFFSET (5 * ? );`, group_id, page)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
				return
			}
			defer data.Close()

			for data.Next() {
				var msg Msg
				if err := data.Scan(&msg.Sender, &msg.Content, &msg.CreateAt, &msg.EmailSender); err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
					return
				}
				conversation = append(conversation, msg)
			}

			utils.RespondWithJSON(w, http.StatusOK, conversation)
		} else if target != "" {
			conversation := []Msg{}
			data, err := api.ReadAll(`
				SELECT  m.sender_id,  m.receiver_id, m.content, m.created_at, u1.email AS sender_email,  u2.email AS receiver_email
				FROM messages m
				JOIN users u1 ON m.sender_id = u1.id
				JOIN users u2 ON m.receiver_id = u2.id
				WHERE (m.sender_id = $1 AND u2.email = $2 )
				OR (u1.email = $2 AND m.receiver_id = $1 )
				ORDER BY m.created_at DESC
				LIMIT 5 OFFSET (5 * $3);`, userId, target, page)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
				return
			}
			defer data.Close()

			for data.Next() {
				var msg Msg
				if err := data.Scan(&msg.Sender, &msg.Receiver, &msg.Content, &msg.CreateAt, &msg.EmailSender, &msg.EmailReceiver); err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
					return
				}
				conversation = append(conversation, msg)
			}

			utils.RespondWithJSON(w, http.StatusOK, conversation)
		} else {
			contact := []User{}
			data, err := api.ReadAll(`
			SELECT id, nickname, firstname, lastname, email, avatarUrl 
			FROM users 
			WHERE is_public = 1 AND id != $1
			`, userId)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
				return
			}
			defer data.Close()

			for data.Next() {
				var user User
				if err := data.Scan(&user.Id, &user.Nickname, &user.FirstName, &user.LastName, &user.Email, &user.AvatarUrl); err != nil {
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
					return
				}
				contact = append(contact, user)
			}

			utils.RespondWithJSON(w, http.StatusOK, contact)
		}
	case http.MethodPost:
		var msg Msg
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}

		group_param := r.URL.Query().Get("group")
		var query string
		var params []any
		isGroupMsg := false

		if group_param != "" {
			isGroupMsg = true
			query = `INSERT INTO messages ( sender_id, group_id, content) VALUES( ?, ?, ? );`
			params = []any{userId, msg.Group_id, msg.Content}

			allMembers, err := api.ReadAll("SELECT user_id FROM group_members WHERE group_id = ? AND status = 'accepted';", msg.Group_id)
			if err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
				return
			}
			defer allMembers.Close()

			for allMembers.Next() {
				var member_id int
				if err := allMembers.Scan(&member_id); err != nil {
					fmt.Println(err)
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
					return
				}
				msg.Group_members = append(msg.Group_members, member_id)
			}
		} else {
			query = `INSERT INTO messages ( sender_id, receiver_id, content)
					VALUES(?, (SELECT id FROM users WHERE email = ?), ?);`
			params = []any{userId, msg.EmailReceiver, msg.Content}
		}

		msgID, err := api.Create(query, params...)
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}

		var brodMessage Msg
		if !isGroupMsg {
			data := api.Read(`
			SELECT  m.sender_id,  m.receiver_id, m.content, m.created_at, u1.email AS sender_email,  u2.email AS receiver_email
			FROM messages m
			JOIN users u1 ON m.sender_id = u1.id
			JOIN users u2 ON m.receiver_id = u2.id
			WHERE m.id = ? ;`, msgID)

			if err := data.Scan(&brodMessage.Sender, &brodMessage.Receiver, &brodMessage.Content, &brodMessage.CreateAt, &brodMessage.EmailSender, &brodMessage.EmailReceiver); err != nil {
				fmt.Println("error on marshling", err)
			}
		} else {
			data := api.Read(`
			SELECT  m.sender_id, m.content, m.created_at, u1.email AS sender_email FROM messages m
			JOIN users u1 ON m.sender_id = u1.id WHERE m.id = ? ;`, msgID)

			if err := data.Scan(&brodMessage.Sender, &brodMessage.Content, &brodMessage.CreateAt, &brodMessage.EmailSender); err != nil {
				fmt.Println("error on marshling", err)
			}
			brodMessage.Group_id = msg.Group_id
			brodMessage.Group_members = msg.Group_members
		}

		api.HUB.Message <- &brodMessage

		utils.RespondWithJSON(w, http.StatusCreated, brodMessage)
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
	}
}
