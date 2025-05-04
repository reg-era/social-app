package core

import (
	"fmt"
	"net/http"
	"path"
	"strconv"
	"time"

	"social/pkg/utils"
)

type GroupPost struct {
	ID         int    `json:"PostId"`
	User       User   `json:"user"`
	Content    string `json:"postText"`
	ImageURL   string `json:"imagePostUrl"`
	Visibility string `json:"visibility"`
	GroupID    int    `json:"group_id"`
	CreatedAt  string `json:"postTime"`
}

func (a *API) HandleGroupPost(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)

	switch r.Method {
	case http.MethodPost:
		groupId, err := strconv.Atoi(r.FormValue("group_id"))
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid group ID"})
			return
		}

		content := r.FormValue("post")
		// visibility := r.FormValue("visibility")
		visibility := "public"

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
			imagePath = path.Join("api/global/", imagePath) // Ensure correct path
		}

		postId, err := a.Create(`INSERT INTO group_posts (group_id, user_id, content, image_url, visibility,created_at) VALUES (?, ?, ?, ?,?, ?)`, groupId, userId, content, imagePath, visibility,time.Now().UTC())
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
			return
		}

		resPost := a.Read(`
SELECT users.firstname, users.lastname, users.email, users.avatarUrl, group_posts.id, group_posts.content, group_posts.image_url, group_posts.created_at 
FROM group_posts 
JOIN users ON group_posts.user_id = users.id 
WHERE group_posts.id = ?
`, postId)

		var post GroupPost
		if err := resPost.Scan(&post.User.FirstName, &post.User.LastName, &post.User.Email, &post.User.AvatarUrl, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt); err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
			return
		}

		utils.RespondWithJSON(w, http.StatusCreated, post)

	case http.MethodGet:
		groupId, err := strconv.Atoi(r.URL.Query().Get("group_id"))
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid group ID"})
			return
		}

		data, err := a.ReadAll(`
		SELECT users.firstname, users.lastname, users.email, users.avatarUrl, gp.id, gp.content, gp.image_url, gp.created_at, gp.visibility
		FROM group_posts gp
		JOIN users ON gp.user_id = users.id
		WHERE gp.group_id = ?
		ORDER BY gp.created_at DESC;
		`, groupId)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
			return
		}
		defer data.Close()

		allPosts := []GroupPost{}
		for data.Next() {
			var post GroupPost
			if err := data.Scan(&post.User.FirstName, &post.User.LastName, &post.User.Email, &post.User.AvatarUrl, &post.ID, &post.Content, &post.ImageURL, &post.CreatedAt, &post.Visibility); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
				return
			}
			allPosts = append(allPosts, post)
		}

		if err := data.Err(); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, allPosts)

	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
	}
}
