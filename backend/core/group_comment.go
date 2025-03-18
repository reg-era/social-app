package core

import (
	"fmt"
	"net/http"
	"strconv"

	"social/pkg/utils"
)

type group_Comment struct {
	ID        int    `json:"CommentId"`
	User      User   `json:"user"`
	Content   string `json:"commentText"`
	PostID    int    `json:"post_id"`
	CreatedAt string `json:"commentTime"`
}

func (a *API) HandleGroupPostComments(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)


	switch r.Method {
	case http.MethodPost:
		postId, err := strconv.Atoi(r.FormValue("post_id"))
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid post ID"})
			return
		}
		group_Id, err := strconv.Atoi(r.FormValue("group_id"))
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid post ID"})
			return
		}

		content := r.FormValue("comment")

		commentId, err := a.Create(`INSERT INTO group_comments (post_id, user_id, content, group_id) VALUES (?, ?, ?,?)`, postId, userId, content, group_Id)
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
			return
		}

		resComment := a.Read(`
		SELECT users.firstname, users.lastname, users.email, users.avatarUrl, group_comments.id, group_comments.content, group_comments.created_at 
		FROM group_comments
		JOIN users ON group_comments.user_id = users.id
		WHERE group_comments.id = ?
		`, commentId)

		var comment group_Comment
		if err := resComment.Scan(&comment.User.FirstName, &comment.User.LastName, &comment.User.Email, &comment.User.AvatarUrl, &comment.ID, &comment.Content, &comment.CreatedAt); err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"faild": "Status Internal Server Error"})
			return
		}

		utils.RespondWithJSON(w, http.StatusCreated, comment)

	case http.MethodGet:

		postId, err := strconv.Atoi(r.URL.Query().Get("post_id"))
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid post ID"})
			return
		}

		data, err := a.ReadAll(`
		SELECT users.firstname, users.lastname, users.email, users.avatarUrl, pc.id, pc.content, pc.created_at
		FROM group_comments pc
		JOIN users ON pc.user_id = users.id
		WHERE pc.post_id = ?
		ORDER BY pc.created_at DESC;
		`, postId)
		if err != nil {
			fmt.Println(err)

			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
			return
		}
		defer data.Close()

		allComments := []group_Comment{}
		for data.Next() {
			var comment group_Comment
			if err := data.Scan(&comment.User.FirstName, &comment.User.LastName, &comment.User.Email, &comment.User.AvatarUrl, &comment.ID, &comment.Content, &comment.CreatedAt); err != nil {
			fmt.Println(err)
				
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
				return
			}
			allComments = append(allComments, comment)
		}

		if err := data.Err(); err != nil {
			fmt.Println(err)

			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Status Internal Server Error"})
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, allComments)

	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
	}
}
