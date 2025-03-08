package core

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"social/pkg/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type API struct {
	DB *sql.DB
}

func (a *API) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var userForm struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&userForm); err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Status Internal Server Error",
		})
		return
	}

	infos := a.Read(`SELECT id, password FROM users WHERE email = ? OR nickname= ?;`, userForm.Login, userForm.Login)

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
	_ , err := a.DB.Exec(`delete from sessions where user_id = ?`, userId)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Status Internal Server Error",
		})
		return
	}
	expiery := time.Now().Add(time.Hour * 24)
	_, err = a.Create(`INSERT INTO sessions (session_hash, user_id, expires_at) VALUES (? , ?, ?);`, token, userId, expiery)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Status Internal Server Error",
		})
		return
	}
	http.SetCookie(
		w,
		&http.Cookie{
			Name:     "session",
			Value:    token,
			Expires:  expiery,
			Path:    "/",
		},
	)
	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("Authorization", token)
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{
		"valid": "user login succesfully ",
	})
}

func (a *API) ValidateSession(session string, db *sql.DB) (int, error) {
	info := a.Read(`SELECT user_id FROM sessions WHERE session_hash = ? ;`, session)

	var userId int
	if err := info.Scan(&userId); err != nil {
		return 0, err
	}
	return userId, nil
}

func (a *API) HandleLogout(w http.ResponseWriter, r *http.Request) {
	// 1. Get cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
			"error": "session not found",
		})
	}

	_, err = a.DB.Exec("DELETE FROM sessions WHERE session_hash = ?", cookie.Value)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "failed clean ",
		})
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"valid": "Logged out"})
}
