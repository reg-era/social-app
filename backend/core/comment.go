package core

import (
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
	userId := r.Context().Value("userID").(int)
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
		commentId, err := a.Create(`INSERT INTO comments (post_id, user_id, content, image_url) VALUES (?, ?, ?, ?)`, postId, userId, content, imagePath)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"failed": "Status Internal Server Error",
			})
			return
		}

		resComment := a.Read(`
		SELECT users.first_name, users.last_name, comments.content, comments.created_at, image_url FROM comments
        JOIN users ON comments.user_id = users.id WHERE comments.id = ?`, commentId)

		var comment Comment
		var first, last string
		var postCreator int
		if err := resComment.Scan(&first, &last, &comment.Content, &comment.CreatedAt, &comment.ImageUrl); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
				"failed": "Status Internal Server Error",
			})
			return
		}
		comment.ID = int(commentId)
		comment.PostID = postId
		comment.Username = first + " " + last
		utils.RespondWithJSON(w, http.StatusCreated, comment)
		a.HUB.Notification <- &Note{
			Type:     "post_comment",
			Sender:   userId,
			Receiver: postCreator,
			Content:  "",
		}
	case http.MethodGet:
		param := r.URL.Query().Get("postID")
		if param != "" {
			postId, err := strconv.Atoi(param)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
					"error": "Invalid post ID",
				})
				return
			}
			offset := r.URL.Query().Get("offset")
			query := `SELECT users.first_name, users.last_name, comments.id, comments.post_id, comments.content, comments.created_at, comments.image_url FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at DESC LIMIT 5`
			args := []interface{}{postId}
			if offset != "" {
				query += " OFFSET ?"
				offsetInt, err := strconv.Atoi(offset)
				if err != nil {
					utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
						"error": "Invalid offset",
					})
					return
				}
				args = append(args, offsetInt)
			}
			dataRows, err := a.ReadAll(query, args...)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Status Internal Server Error",
				})
				return
			}
			defer dataRows.Close()
			var allComments []Comment
			for dataRows.Next() {
				var comment Comment
				var first, last string
				if err := dataRows.Scan(&first, &last, &comment.ID, &comment.PostID, &comment.Content, &comment.CreatedAt, &comment.ImageUrl); err != nil {
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
						"failed": "Status Internal Server Error",
					})
					return
				}
				comment.Username = first + " " + last
				allComments = append(allComments, comment)
			}
			if err := dataRows.Err(); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"failed": "Status Internal Server Error",
				})
				return
			}

			response := struct {
				Comments []Comment `json:"comments"`
				NextId   int       `json:"next_id"`
			}{}

			if len(allComments) > 0 {
				response.NextId = allComments[len(allComments)-1].ID - 1
			}
			response.Comments = allComments
			utils.RespondWithJSON(w, http.StatusOK, response)
		} else {
			dataRows, err := a.ReadAll(`SELECT users.first_name, users.last_name, comments.id, comments.post_id, comments.content, comments.created_at FROM comments JOIN users ON comments.user_id = users.id ORDER BY comments.created_at DESC LIMIT 5`)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"error": "Status Internal Server Error",
				})
				return
			}
			defer dataRows.Close()
			var allComments []Comment
			for dataRows.Next() {
				var comment Comment
				var first, last string
				if err := dataRows.Scan(&first, &last, &comment.ID, &comment.PostID, &comment.Content, &comment.CreatedAt); err != nil {
					utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
						"failed": "Status Internal Server Error",
					})
					return
				}
				comment.Username = first + " " + last
				allComments = append(allComments, comment)
			}
			if err := dataRows.Err(); err != nil {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
					"failed": "Status Internal Server Error",
				})
				return
			}

			response := struct {
				Comments []Comment `json:"comments"`
				NextId   int       `json:"next_id"`
			}{}

			if len(allComments) > 0 {
				response.NextId = allComments[len(allComments)-1].ID
			}
			response.Comments = allComments
			utils.RespondWithJSON(w, http.StatusOK, response)
		}
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
