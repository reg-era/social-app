package middleware

import (
	"database/sql"
	"net/http"

	"social/core"
	"social/pkg/utils"
)

type CustomizedHandler func(http.ResponseWriter, *http.Request, *sql.DB, int)

func MiddleWare(db *sql.DB, handler CustomizedHandler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.URL.Path == "/api/user" && r.Method == http.MethodPost {
			core.HandleUser(w, r, db, 0)
			return
		}

		if handler == nil {
			switch r.URL.Path {
			case "/api/login":
				if r.Method == http.MethodPost {
					core.HandleLogin(w, r, db)
				}

			case "/api/check":
				if r.Method == http.MethodPost {
					token := r.Header.Get("Authorization")
					if token == "" {
						utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{
							"error": "Unauthorized operation",
						})
						return
					}

					_, err := core.ValidateSession(token, db)
					if err != nil {
						utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{
							"error": "Unauthorized operation",
						})
					} else {
						utils.RespondWithJSON(w, http.StatusOK, map[string]string{
							"valid": "valid user",
						})
					}
					return
				}

			default:
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{
					"error": "Page Not Found",
				})
			}
			return
		}

		token := r.Header.Get("Authorization")
		if token == ""  {
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{
				"error": "Unauthorized operation",
			})
			return
		}

		userId, err := core.ValidateSession(token, db)
		if err != nil {
			utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{
				"error": "Unauthorized operation",
			})
			return
		}

		handler(w, r, db, userId)
	})
}
