package core

import (
	"database/sql"
	"fmt"
	"net/http"
	"regexp"
	"strconv"

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
}

func (a *API) HandleUser(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	target := r.URL.Query().Get("target")
	if target == "following" || target == "follower" {
		targetEmail := r.URL.Query().Get("user")
		indexing := map[bool]struct {
			key   string
			value string
		}{true: {key: "u2.email", value: targetEmail}, false: {key: "u2.id", value: strconv.Itoa(userId)}}[targetEmail != ""]

		nich := map[bool]struct {
			from string
			to   string
		}{true: {from: "f.following_id", to: "f.follower_id"}, false: {from: "f.following_id", to: "f.follower_id"}}[target == "following"]
		fmt.Println(indexing)
		fmt.Println(nich)

		response := []User{}
		data, err := a.ReadAll(`
		SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public
		FROM users u
		JOIN follows f ON u.id = `+nich.from+`
		JOIN users u2 ON `+nich.to+` = u2.id
		WHERE `+indexing.key+` = ? ;
		`, indexing.value)
		defer data.Close()
		if err != nil {
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"error": "status internal server error"},
			)
			return
		}

		for data.Next() {
			var newFoll User
			if err := data.Scan(&newFoll.Email, &newFoll.FirstName, &newFoll.LastName, &newFoll.DateOfBirth, &newFoll.AvatarUrl, &newFoll.Nickname, &newFoll.AboutMe, &newFoll.IsPublic); err != nil {
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"error": "status internal server error"},
				)
				return
			}
			response = append(response, newFoll)
		}
		utils.RespondWithJSON(w, http.StatusOK, response)
	} else if target == "post" {
		targetEmail := r.URL.Query().Get("user")
		indexing := map[bool]struct {
			key   string
			value string
		}{true: {key: "users.email", value: targetEmail}, false: {key: "users.id", value: strconv.Itoa(userId)}}[targetEmail != ""]

		response := []Post{}
		data, err := a.ReadAll(`
		SELECT users.firstname, users.lastname, posts.id, posts.content, posts.image_url, posts.created_at FROM posts 
		JOIN users ON posts.user_id = users.id 
		WHERE `+indexing.key+` = ? ;`, indexing.value)
		defer data.Close()
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}

		for data.Next() {
			var post Post
			var first, last string
			if err := data.Scan(&first, &last, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
				return
			}
			post.Username = first + " " + last
			response = append(response, post)
		}
		utils.RespondWithJSON(w, http.StatusOK, response)
	} else if target != "" {
		var guest User
		data_userInfo := a.Read(`
			SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public,
			(SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followings,
			(SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) AS followers
			FROM users u WHERE email = ?  AND is_public = 1 ;
			`, target)

		if err := data_userInfo.Scan(&guest.Email, &guest.FirstName, &guest.LastName, &guest.DateOfBirth, &guest.AvatarUrl, &guest.Nickname, &guest.AboutMe, &guest.IsPublic, &guest.Followings, &guest.Followers); err != nil {
			if err == sql.ErrNoRows {
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "User Status Not Found"})
				return
			}
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "status internal server error"})
			return
		}
		utils.RespondWithJSON(w, http.StatusOK, guest)
	} else {
		var userInfo User
		if err := a.ReadUser(userId, &userInfo); err != nil {
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

func (a *API) ReadUser(id int, user *User) error {
	data_userInfo := a.Read(`
	SELECT u.email, u.firstname, u.lastname, u.birthdate, u.avatarUrl, u.nickname, u.about, u.is_public,
	(SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followings,
	(SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) AS followers
	FROM users u WHERE id = ? ;
	`, id)

	if err := data_userInfo.Scan(&user.Email, &user.FirstName, &user.LastName, &user.DateOfBirth, &user.AvatarUrl, &user.Nickname, &user.AboutMe, &user.IsPublic, &user.Followings, &user.Followers); err != nil {
		return err
	}
	return nil
}

// SELECT p.* FROM posts p
// WHERE
// -- Public posts are visible to everyone
// (p.visibility = 'public')
//
// OR
//
// -- Posts with "followers" visibility where the viewer follows the creator
// (p.visibility = 'followers' AND EXISTS (
// SELECT 1 FROM follows
// WHERE follower_id = ? AND following_id = p.user_id
// ))
//
// OR
//
// -- Private posts where the viewer is explicitly allowed
// (p.visibility = 'private' AND EXISTS (
// SELECT 1 FROM post_viewers
// WHERE post_id = p.id AND user_id = ?
// ))
//
// -- Include the user's own posts
// OR p.user_id = ?
//
// -- Also include posts from groups the user is a member of
// OR (p.group_id IN (
// SELECT group_id FROM group_members
// WHERE user_id = ? AND status = 'accepted'
// ))
//
// ORDER BY p.created_at DESC
