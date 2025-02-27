package core

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	data "social/pkg/db"
	"social/pkg/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func HandleLogin(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var userForm struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&userForm); err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Status Internal Server Error",
		})
		return
	}

	infos, err := data.Read(db, `SELECT id, password_hash FROM users WHERE email = ? ;`, userForm.Email)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
		return
	}

	var userId int
	var hash string
	if err := infos.Scan(&userId, &hash); err != nil {
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(userForm.Password)); err != nil {
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
		return
	}

	token := uuid.NewString()
	_, err = data.Create(db, `INSERT INTO sessions (session_id, user_id) VALUES (? , ?);`, token, userId)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Status Internal Server Error",
		})
		return
	}

	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("Authorization", token)
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{
		"valid": "user login succesfully ",
	})
}

func ValidateSession(session string, db *sql.DB) (int, error) {
	info, err := data.Read(db, `SELECT user_id FROM sessions WHERE session_id = ? ;`, session)
	if err != nil {
		return 0, err
	}

	var userId int
	if err := info.Scan(&userId); err != nil {
		return 0, err
	}
	fmt.Println(userId)
	return userId, nil
}
