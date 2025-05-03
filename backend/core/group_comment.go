package core

import (
	"fmt"
	"net/http"
	"path"
	"strconv"

	"social/pkg/utils"
)

type GroupComment struct {
	ID        int    `json:"comment_id"`
	GroupID   int    `json:"group_id"`
	PostID    int    `json:"post_id"`
	Username  string `json:"author_name"`
	Content   string `json:"content"`
	ImageUrl  string `json:"image_url"`
	CreatedAt string `json:"comment_time"`
}

func (a *API) HandleGroupPostComments(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	fmt.Println("group comments fetched")
	switch r.Method {
	case http.MethodPost:
		groupId, err := strconv.Atoi(r.FormValue("group_id"))
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"failed": "Invalid group_id"})
			return
		}

		postId, err := strconv.Atoi(r.FormValue("post_id"))
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"failed": "Invalid post_id"})
			return
		}

		content := r.FormValue("comment")
		file, handler, err := r.FormFile("image")
		var imagePath string
		if err == nil {
			fmt.Println(err)
			imagePath, err = utils.UploadFileData(file, handler)
			if err != nil {
				fmt.Println(err)
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
			`INSERT INTO group_comments (group_id, post_id, user_id, content, image_url) VALUES (?, ?, ?, ?, ?)`,
			groupId,
			postId,
			userId,
			content,
			imagePath,
		)
		if err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"failed": "Status Internal Server Error"},
			)
			return
		}

		resComment := a.Read(`
        SELECT u.firstname, u.lastname, c.id, c.content, c.image_url, c.created_at FROM group_comments c
        JOIN users u ON user_id = u.id
        WHERE c.id = ?`, commentId)

		var comment GroupComment
		var first, last string
		if err := resComment.Scan(&first, &last, &comment.ID, &comment.Content, &comment.ImageUrl, &comment.CreatedAt); err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(
				w,
				http.StatusInternalServerError,
				map[string]string{"failed": "Status Internal Server Error"},
			)
			return
		}
		comment.Username = first + " " + last
		utils.RespondWithJSON(w, http.StatusCreated, comment)

	case http.MethodGet:
		groupId, err := strconv.Atoi(r.URL.Query().Get("groupID"))
		if groupId == 0 || err != nil {
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid group_id"})
			return
		}

		postId, err := strconv.Atoi(r.URL.Query().Get("postID"))
		if postId == 0 || err != nil {
			fmt.Println(err)
			utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid post_id"})
			return
		}

		page := 0
		if param := r.URL.Query().Get("page"); param != "" {
			page, err = strconv.Atoi(param)
			if err != nil {
				fmt.Println(err)
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid page number"})
				return
			}
		}

		dataRows, err := a.ReadAll(`
        SELECT u.firstname, u.lastname, c.id, c.group_id, c.post_id, c.content, c.image_url, c.created_at FROM group_comments c
        JOIN users u ON user_id = u.id
        WHERE c.group_id = ? AND c.post_id = ?
        ORDER BY c.created_at DESC
        LIMIT 3 OFFSET (3 * ?)`, groupId, postId, page)
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

		allComments := []GroupComment{}
		for dataRows.Next() {
			var comment GroupComment
			var first, last string
			if err := dataRows.Scan(&first, &last, &comment.ID, &comment.GroupID, &comment.PostID, &comment.Content, &comment.ImageUrl, &comment.CreatedAt); err != nil {
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
