package core

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	data "social/pkg/db"
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
	fmt.Println("Handling post")

	switch r.Method {
	case http.MethodPost:
		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		query := "INSERT INTO posts (id, user_id, content, image_url, shown_to, group_id) VALUES (?, ?, ?, ?, ?, ?)"
		_, err := data.Create(db, query, post.ID, post.UserID, post.Content, post.ImageURL, post.ShownTo, post.GroupID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(post)

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
