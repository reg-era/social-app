package core

import (
	"fmt"
	"net/http"
	"path"
	"strconv"

	"social/pkg/utils"
)

type Comment struct {
	ID        int    `json:"comment_id"`
	PostID    int    `json:"post_id"`
	Username  string `json:"author_name"`
	Content   string `json:"content"`
	ImageUrl  string `json:"image_url"`
	CreatedAt string `json:"comment_time"`
}

func (a *API) HandleComment(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	switch r.Method {
	case http.MethodPost:
		postId, err := strconv.Atoi(r.FormValue("postID"))
		if err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"failed": "Invalid post_id"})
			return
		}

		content := r.FormValue("comment")
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
		commentId, err := a.Create(
			`INSERT INTO comments (post_id, user_id, content, image_url) VALUES (?, ?, ?, ?)`,
			postId,
			userId,
			content,
			imagePath,
		)
		if err != nil {
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"failed": "Status Internal Server Error"},
			)
			return
		}

		resComment := a.Read(`
		SELECT  u.firstname, u.lastname, c.id, c.content, c.image_url, c.created_at FROM comments c
		JOIN users u ON user_id = u.id
		WHERE c.id = ?`, commentId)

		var comment Comment
		var first, last string
		var postCreator int
		if err := resComment.Scan(&first, &last, &comment.ID, &comment.Content, &comment.ImageUrl, &comment.CreatedAt); err != nil {
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"failed": "Status Internal Server Error"},
			)
			return
		}
		comment.Username = first + " " + last
		utils.RespondWithJSON(w, http.StatusCreated, comment)
		a.HUB.Notification <- &Note{
			Type:     "post_comment",
			Sender:   userId,
			Receiver: postCreator,
			Content:  "",
		}
	case http.MethodGet:
		param1 := r.URL.Query().Get("id")
		postId, err := strconv.Atoi(param1)
		if postId == 0 || err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Status Bad Request"})
			return
		}

		page := 0
		if param2 := r.URL.Query().Get("page"); param2 != "" {
			var err error
			if page, err = strconv.Atoi(param2); err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Status Bad Request"})
				return
			}
		}

		dataRows, err := a.ReadAll(`
		SELECT  u.firstname, u.lastname, c.id, c.post_id, c.content, c.image_url, c.created_at FROM comments c
		JOIN users u ON user_id = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at DESC
		LIMIT 3 OFFSET (3 * ?) `, postId, page)
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"error": "Status Internal Server Error"},
			)
			return
		}
		defer dataRows.Close()

		allComments := []Comment{}
		for dataRows.Next() {
			var comment Comment
			var first, last string
			if err := dataRows.Scan(&first, &last, &comment.ID, &comment.PostID, &comment.Content, &comment.ImageUrl, &comment.CreatedAt); err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(
					w,
					http.StatusInternalServerError,
					map[string]string{"failed": "Status Internal Server Error"},
				)
				return
			}
			comment.Username = first + " " + last
			allComments = append(allComments, comment)
		}

		utils.RespondWithJSON(w, http.StatusOK, allComments)
	default:
		utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Status Method Not Allowed"})
	}
}
