package core

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"social/pkg/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type API struct {
	DB  *sql.DB
	HUB *NetworkHub
}

func (a *API) HandleLogin(w http.ResponseWriter, r *http.Request) {
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

	infos := a.Read(`SELECT id, password FROM users WHERE email = ? ;`, userForm.Email)
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
	_, err := a.Create(`INSERT INTO sessions (session_hash, user_id) VALUES (? , ?);`, token, userId)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Status Internal Server Error",
		})
		return
	}

	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("Authorization", token)
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{
		"valid": "user login succesfully 🦓",
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
	session := r.Header.Get("Authorization")
	if session == "" {
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
			"error": "session not found",
		})
		return
	}

	_, err := a.DB.Exec("DELETE FROM sessions WHERE session_hash = ?", session)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "failed clean ",
		})
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"valid": "Logged out"})
}
