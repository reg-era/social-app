package middleware

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"social/core"
	"social/pkg/utils"
)

type API struct {
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

func (api *API) AuthMiddleware(next http.HandlerFunc) http.Handler {
	if api.API == nil {
		fmt.Println("7maaaaar")
		return nil
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_session")
		fmt.Println(cookie.Value)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
			return
		}

		var userID int
		err = api.DB.QueryRow(`SELECT user_id FROM sessions WHERE session_hash = ?`, cookie.Value).Scan(&userID)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid session"})
			} else {
				utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Invalid operation"})
			}
			return
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
