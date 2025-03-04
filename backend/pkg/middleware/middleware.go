package middleware

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"social/core"
	"social/pkg/utils"
)

type Middleware struct {
	*core.API
}

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (m *Middleware) AuthMiddleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
			return
		}

		var userID int
		var expiresAt time.Time
		err = m.DB.QueryRow(
			"SELECT user_id, expires_at FROM sessions WHERE session_id = $1",
			cookie.Value,
		).Scan(&userID, &expiresAt)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid session"})
			} else {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})
			}
			return
		}

		if time.Now().After(expiresAt) {
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Session expired"})
			return
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
