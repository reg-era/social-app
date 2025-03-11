package core

import (
	"fmt"
	"net/http"
	"path"
	"strconv"

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

func (a *API) HandlePost(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	switch r.Method {
	case http.MethodPost:
		content := r.FormValue("post")
		visibility := r.FormValue("visibility")
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

		postId, err := a.Create(`INSERT INTO posts (user_id, content, image_url, visibility) VALUES (?, ?, ?, ?)`, userId, content, imagePath, visibility)
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"faild": "Status Internal Server Error",
			})
			return
		}

		resPost := a.Read(`
		SELECT users.firstname, users.lastname ,posts.content, posts.image_url, posts.created_at FROM posts
		JOIN users ON posts.user_id = users.id
		WHERE posts.id = ?
		`, postId)

		var post Post
		var first, last string
		if err := resPost.Scan(&first, &last, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"faild": "Status Internal Server Error",
			})
			return
		}
		post.ID = int(postId)
		post.Username = first + " " + last
		utils.RespondWithJSON(w, http.StatusCreated, post)
	case http.MethodGet:

		param := r.URL.Query().Get("postID")
		var query string
		var queryParams []interface{}
		if param != "" {
			offset, err := strconv.Atoi(param)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Status Bad Request"})
				return
			}

			query = `
			SELECT users.firstname, users.lastname, posts.id, posts.content, posts.image_url, posts.created_at
			FROM posts
			JOIN users ON posts.user_id = users.id
			JOIN post_viewers ON posts.id = post_viewers.post_id
			WHERE (
				visibility = 'public' OR 
				((visibility = 'private' OR visibility = 'followers' ) AND post_viewers.user_id = ?)
			) AND posts.id > ?
			ORDER BY posts.created_at DESC LIMIT 5;`
			queryParams = append(queryParams, userId, offset)

		} else {
			query = `
			SELECT users.firstname, users.lastname, posts.id, posts.content, posts.image_url, posts.created_at
			FROM posts
			JOIN users ON posts.user_id = users.id
			JOIN post_viewers ON posts.id = post_viewers.post_id
			WHERE visibility = 'public'
			OR ((visibility = 'private' OR visibility = 'followers' ) AND post_viewers.user_id = ?)
			ORDER BY posts.created_at DESC LIMIT 5;`
			queryParams = append(queryParams, userId)
		}

		data, err := a.ReadAll(query, queryParams...)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Status Internal Server Error",
			})
			return
		}
		defer data.Close()

		response := struct {
			Posts  []Post `json:"posts"`
			NextId int    `json:"next_id"`
		}{}

		var allPost []Post
		for data.Next() {
			var post Post
			var first, last string
			if err := data.Scan(&first, &last, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Status Internal Server Error",
				})
				return
			}
			post.Username = first + " " + last
			allPost = append(allPost, post)
			response.NextId = post.ID
		}

		if err := data.Err(); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Status Internal Server Error",
			})
			return
		}

		response.Posts = allPost
		utils.RespondWithJSON(w, http.StatusOK, response)
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{
			"error": "Status Method Not Allowed",
		})
	}
}
