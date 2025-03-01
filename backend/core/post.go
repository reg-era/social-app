package core

import (
	"database/sql"
	"net/http"
	"path"
	"strconv"

	data "social/pkg/db"
	"social/pkg/utils"
)

type Post struct {
	ID       int    `json:"PostId"`
	Username string `json:"authorName"`
	Content  string `json:"postText"`
	ImageURL string `json:"imagePostUrl"`
	// ShownTo   string `json:"shown_to"`
	// GroupID   string `json:"group_id"`
	CreatedAt string `json:"postTime"`
}

func HandlePost(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	switch r.Method {
	case http.MethodPost:
		content := r.FormValue("post")
		file, handler, err := r.FormFile("image")
		var imagePath string
		if err == nil {
			imagePath, err = utils.UploadFileData(file, handler)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
					"error": err.Error(),
				})
				return
			}
		}

		if imagePath != "" {
			imagePath = path.Join("api/global/", imagePath)
		}

		postId, err := data.Create(db, `INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)`, userId, content, imagePath)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"faild": "Status Internal Server Error",
			})
			return
		}

		resPost := data.Read(db, `
		SELECT users.first_name,users.last_name,posts.content,posts.image_url,posts.created_at FROM posts
		JOIN users ON posts.user_id = users.id
		WHERE posts.id = ?
		`, postId)

		var post Post
		var first, last string
		if err := resPost.Scan(&first, &last, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"faild": "Status Internal Server Error",
			})
			return
		}
		post.ID = int(postId)
		post.Username = first + " " + last
		utils.RespondWithJSON(w, http.StatusCreated, post)
	case http.MethodGet:
		response := struct {
			Posts  []Post `json:"posts"`
			NextId int    `json:"next_id"`
		}{}
		param := r.URL.Query().Get("post_id")
		if param != "" {
			offset, err := strconv.Atoi(param)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
					"error": "Status Bad Request",
				})
				return
			}
			data, err := data.ReadAll(db, `SELECT users.first_name, users.last_name, posts.id, posts.content, posts.image_url, posts.created_at FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id <= ? ORDER BY posts.created_at DESC LIMIT 5 OFFSET 0;`, offset)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Status Internal Server Error",
				})
				return
			}
			defer data.Close()
			var allPost []Post
			for data.Next() {
				var post Post
				var first, last string
				if err := data.Scan(&first, &last, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
						"faild": "Status Internal Server Error",
					})
					return
				}
				post.Username = first + " " + last
				allPost = append(allPost, post)
				response.NextId = post.ID - 1
			}
			if err := data.Err(); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"faild": "Status Internal Server Error",
				})
				return
			}

			response.Posts = allPost
			utils.RespondWithJSON(w, http.StatusCreated, response)
		} else {
			data, err := data.ReadAll(db, `SELECT users.first_name, users.last_name, posts.id, posts.content, posts.image_url, posts.created_at FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC LIMIT 5 OFFSET 0;`)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"faild": "Status Internal Server Error",
				})
				return
			}
			defer data.Close()

			var allPost []Post
			for data.Next() {
				var post Post
				var first, last string
				if err := data.Scan(&first, &last, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
						"faild": "Status Internal Server Error",
					})
					return
				}
				post.Username = first + " " + last
				allPost = append(allPost, post)
				response.NextId = post.ID - 1
			}
			if err := data.Err(); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"faild": "Status Internal Server Error",
				})
				return
			}

			response.Posts = allPost
			utils.RespondWithJSON(w, http.StatusCreated, response)
		}
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
