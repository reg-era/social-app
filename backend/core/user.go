package core

import (
	"database/sql"
	"fmt"
	"net/http"
	"regexp"

	"social/pkg/utils"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id          int    `json:"id"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DateOfBirth string `json:"dateOfBirth"`
	AvatarUrl   string `json:"avatarUrl"`
	Nickname    string `json:"nickname"`
	AboutMe     string `json:"aboutMe"`
	IsPublic    bool   `json:"isPublic"`
	Followers   int    `json:"followers"`
	Followings  int    `json:"followings"`
	IsFollowing string `json:"isFollowing"`
}

func (a *API) HandleUser(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	target := r.URL.Query().Get("target")
	checking_email := r.URL.Query().Get("user")
	if (target != "following" && target != "follower" && target != "post" && target != "") || (target != "following" && target != "follower" && target != "post" && checking_email != "") || ((target == "following" || target == "follower" || target == "post") && checking_email != "") {
		var arg string
		if checking_email == "" {
			arg = target
		} else {
			arg = checking_email
		}

		var isPublic bool
		if err := a.Read(`SELECT is_public FROM users WHERE email = ? ;`, arg).Scan(&isPublic); err != nil {
			if err == sql.ErrNoRows {
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "status Not Found"})
				return
			}
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}
		//
		if !isPublic {
			var exist bool
			if err := a.Read(`SELECT 1 FROM follows WHERE follower_id = ? AND following_id = (SELECT id FROM users WHERE email = ? ) ;`, userId, arg).Scan(&exist); err != nil {
				if err == sql.ErrNoRows {
					utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "status Unauthorized"})
					return
				}
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
				return
			}
		}
	}

	if target == "following" || target == "follower" {
		var query string
		var args []any
		targetEmail := r.URL.Query().Get("user")

		if target == "following" {
			if targetEmail != "" {
				query = `
				SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public
				FROM users u
				JOIN follows f ON u.id = f.following_id
				JOIN users u2 ON f.follower_id = u2.id
				WHERE u2.email = ?`
				args = append(args, targetEmail)
			} else {
				query = `
				SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public
				FROM users u
				JOIN follows f ON u.id = f.following_id
				WHERE f.follower_id = ?`
				args = append(args, userId)
			}
		} else {
			if targetEmail != "" {
				query = `
				SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public
				FROM users u
				JOIN follows f ON u.id = f.follower_id
				JOIN users u2 ON f.following_id = u2.id
				WHERE u2.email = ?`
				args = append(args, targetEmail)
			} else {
				query = `
				SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public
				FROM users u
				JOIN follows f ON u.id = f.follower_id
				WHERE f.following_id = ?`
				args = append(args, userId)
			}
		}

		data, err := a.ReadAll(query, args...)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}
		defer data.Close()

		response := []User{}
		for data.Next() {
			var user User
			if err := data.Scan(&user.Email, &user.FirstName, &user.LastName, &user.DateOfBirth, &user.AvatarUrl, &user.Nickname, &user.AboutMe, &user.IsPublic); err != nil {
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"error": "status internal server error"},
				)
				return
			}
			response = append(response, user)
		}

		utils.RespondWithJSON(w, http.StatusOK, response)
	} else if target == "post" {
		targetEmail := r.URL.Query().Get("user")
		var query string
		var args any
		if targetEmail != "" {
			query = `SELECT users.firstname, users.lastname, users.email, users.avatarUrl, posts.id, posts.content, posts.image_url, posts.created_at FROM posts 
			JOIN users ON posts.user_id = users.id 
			WHERE users.email = ? 
			ORDER BY posts.created_at DESC `
			args = targetEmail
		} else {
			query = `SELECT users.firstname, users.lastname, users.email, users.avatarUrl, posts.id, posts.content, posts.image_url, posts.created_at FROM posts 
			JOIN users ON posts.user_id = users.id 
			WHERE users.id = ? 
			ORDER BY posts.created_at DESC `
			args = userId
		}

		response := []Post{}
		data, err := a.ReadAll(query, args)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}
		defer data.Close()

		for data.Next() {
			var post Post
			if err := data.Scan(&post.User.FirstName, &post.User.LastName, &post.User.Email, &post.User.AvatarUrl, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
				return
			}
			response = append(response, post)
		}
		utils.RespondWithJSON(w, http.StatusOK, response)
	} else if target != "" {
		var guest User
		data_userInfo := a.Read(`
			SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public,
			(SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followings,
			(SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) AS followers,
			(EXISTS(
				SELECT 1 FROM follows 
				WHERE follower_id = $1 AND following_id = (SELECT id FROM users WHERE email = $2)
			)) AS is_following,
			(EXISTS(
				SELECT 1 FROM follow_requests 
				WHERE follower_id = $1 AND following_id = (SELECT id FROM users WHERE email = $2) AND status = 'pending'
			)) AS is_request
			FROM users u WHERE email = $2 ;
			`, userId, target)

		var isFollow, isRequest bool
		if err := data_userInfo.Scan(&guest.Email, &guest.FirstName, &guest.LastName, &guest.DateOfBirth, &guest.AvatarUrl, &guest.Nickname, &guest.AboutMe, &guest.IsPublic, &guest.Followers, &guest.Followings, &isFollow, &isRequest); err != nil {
			if err == sql.ErrNoRows {
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "User Status Not Found"})
				return
			}
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}
		if isRequest && !isFollow {
			guest.IsFollowing = "pending"
		} else if isFollow {
			guest.IsFollowing = "followed"
		} else {
			guest.IsFollowing = "unfollowed"
		}
		utils.RespondWithJSON(w, http.StatusOK, guest)
	} else {
		var userInfo User
		data_userInfo := a.Read(`
		SELECT u.id, u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public,
		(SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followings,
		(SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) AS followers
		FROM users u WHERE id = ? ;
		`, userId)

		if err := data_userInfo.Scan(&userInfo.Id, &userInfo.Email, &userInfo.FirstName, &userInfo.LastName, &userInfo.DateOfBirth, &userInfo.AvatarUrl, &userInfo.Nickname, &userInfo.AboutMe, &userInfo.IsPublic, &userInfo.Followers, &userInfo.Followings); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}
		utils.RespondWithJSON(w, http.StatusOK, userInfo)
	}
}

func (a *API) AddUser(user *User) (int, error) {
	const emailRegex = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(emailRegex)

	if len(user.FirstName) <= 0 ||
		len(user.LastName) <= 0 ||
		len(user.Password) <= 0 ||
		!re.MatchString(user.Email) {
		return 404, fmt.Errorf("invalid input format")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return 500, fmt.Errorf("status internal server error")
	}

	if _, err := a.Create(
		`INSERT INTO users
			(email, password, firstname, lastname, birthdate, avatarUrl, nickname, about, is_public)
		VALUES
			(?, ?, ?, ?, ?, ?, ?, ?, ?) ;`,
		user.Email, hash, user.FirstName, user.LastName, user.DateOfBirth, user.AvatarUrl, user.Nickname, user.AboutMe, user.IsPublic); err != nil {
		return 409, fmt.Errorf("faild to add user")
	}
	return 200, nil
}
