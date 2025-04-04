package core

import (
	"fmt"
	"net/http"
	"path"
	"strconv"

	"social/pkg/utils"
)

type Post struct {
	ID   int  `json:"PostId"`
	User User `json:"user"`
	// Username   string `json:"authorName"`
	Content    string `json:"postText"`
	ImageURL   string `json:"imagePostUrl"`
	Visibility string `json:"visibility"`
	// GroupID   string `json:"group_id"`
	CreatedAt string `json:"postTime"`
}

func (a *API) HandlePost(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	switch r.Method {
	case http.MethodPost:
		content := r.FormValue("post")
		visibility := r.FormValue("visibility")
		file, handler, err := r.FormFile("image")
		var imagePath string
		if err == nil {
			imagePath, err = utils.UploadFileData(file, handler)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
		}

		if imagePath != "" {
			imagePath = path.Join("api/global/", imagePath)
		}

		var postId int64
		if visibility == "private" {
			listOfFriends := []string{}
			for i := 0; ; i++ {
				email := r.FormValue(fmt.Sprintf("tagged[email][%d]", i))
				if email == "" {
					break
				}
				listOfFriends = append(listOfFriends, email)
			}
			trx, err := a.DB.Begin()
			if err != nil {
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"faild": "Status Internal Server Error"},
				)
				return
			}
			defer trx.Rollback()

			detai, err := trx.Exec(
				`INSERT INTO posts (user_id, content, image_url, visibility) VALUES (?, ?, ?, ?)`,
				userId,
				content,
				imagePath,
				visibility,
			)
			if err != nil {
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"faild": "Status Internal Server Error"},
				)
				return
			}

			postId, err = detai.LastInsertId()
			if err != nil {
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"faild": "Status Internal Server Error"},
				)
				return
			}

			for i := 0; i < len(listOfFriends); i++ {
				_, err := trx.Exec(
					`INSERT INTO post_viewers ( post_id ,user_id ) VALUES ( ? ,(SELECT id FROM users WHERE email = ?) )`,
					postId,
					listOfFriends[i],
				)
				if err != nil {
					utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"faild": "Status Bad Request"})
					return
				}
			}

			err = trx.Commit()
			if err != nil {
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"faild": "Status Internal Server Error"},
				)
				return
			}
		} else {
			var err error
			postId, err = a.Create(
				`INSERT INTO posts (user_id, content, image_url, visibility) VALUES (?, ?, ?, ?)`, userId, content, imagePath, visibility,
			)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
				return
			}
		}

		resPost := a.Read(`
		SELECT users.firstname, users.lastname,users.email, users.avatarUrl, posts.id, posts.content, posts.image_url, posts.created_at FROM posts
		JOIN users ON posts.user_id = users.id
		WHERE posts.id = ?
		`, postId)

		var post Post
		if err := resPost.Scan(&post.User.FirstName, &post.User.LastName, &post.User.Email, &post.User.AvatarUrl, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"faild": "Status Internal Server Error"},
			)
			return
		}

		utils.RespondWithJSON(w, http.StatusCreated, post)
	case http.MethodGet:
		param := r.URL.Query().Get("page")
		page := 0
		if param != "" {
			var err error
			if page, err = strconv.Atoi(param); err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Status Bad Request"})
				return
			}
		}

		data, err := a.ReadAll(`
		SELECT users.firstname, users.lastname,users.email, users.avatarUrl, p.id, p.visibility, p.content, p.image_url, p.created_at 
		FROM posts p
		JOIN users ON p.user_id = users.id
		WHERE (
			(p.visibility = 'public')
			OR
			(p.visibility = 'followers' AND EXISTS (
				SELECT 1 FROM follows
				WHERE follower_id = $1 AND following_id = p.user_id
			))
			OR
			(p.visibility = 'private' AND EXISTS (
				SELECT 1 FROM post_viewers
				WHERE post_id = p.id AND user_id = $1
			))
			OR p.user_id = $1 
		) 
		ORDER BY p.created_at DESC 
		LIMIT 5 OFFSET (5 * $2);
		`, userId, page)
		if err != nil {
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"error": "Status Internal Server Error"},
			)
			return
		}
		defer data.Close()

		allPost := []Post{}
		for data.Next() {
			var post Post
			if err := data.Scan(&post.User.FirstName, &post.User.LastName, &post.User.Email, &post.User.AvatarUrl, &post.ID, &post.Visibility, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"error": "Status Internal Server Error"},
				)
				return
			}
			allPost = append(allPost, post)
		}

		if err := data.Err(); err != nil {
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"error": "Status Internal Server Error"},
			)
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, allPost)
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
	}
}
