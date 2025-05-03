package middleware

import (
	"context"
	"database/sql"
	"net/http"

	"social/core"
	"social/pkg/utils"
)

type API struct {
	*core.API
}

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, , PUT, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (api *API) AuthMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session := r.Header.Get("Authorization")
		if session == "" {
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
			return
		}

		var userID int
		err := api.DB.QueryRow(`SELECT user_id FROM sessions WHERE session_hash = ?`, session).Scan(&userID)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid session"})
			} else {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Invalid operation"})
			}
			return
		}

		if r.URL.Path == "/api/check" {
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"succes": "valid user"})
			return
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
