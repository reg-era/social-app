package core

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"path"

	data "social/pkg/db"
	"social/pkg/utils"
)

type Post struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	Content   string `json:"content"`
	ImageURL  string `json:"image_url"`
	ShownTo   string `json:"shown_to"`
	GroupID   string `json:"group_id"`
	CreatedAt string `json:"created_at"`
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
			imagePath = path.Join("data/global/", imagePath)
		}

		_, err = data.Create(db, `INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)`, userId, content, imagePath)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"faild": "Status Internal Server Error",
			})
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, map[string]string{
			"valid": "post add succesfuly",
		})
	case http.MethodGet:
		query := "SELECT * FROM posts WHERE user_id = ?"
		rows, err := db.Query(query, userId)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var posts []Post
		for rows.Next() {
			var post Post
			if err := rows.Scan(&post.ID, &post.UserID, &post.Content, &post.ImageURL, &post.ShownTo, &post.GroupID, &post.CreatedAt); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			posts = append(posts, post)
		}
		json.NewEncoder(w).Encode(posts)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
