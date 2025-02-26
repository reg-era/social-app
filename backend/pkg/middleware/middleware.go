package middleware

import (
	"database/sql"
	"net/http"
)

type CustomizedHandler func(http.ResponseWriter, *http.Request, *sql.DB, int)

func MiddleWare(db *sql.DB, handler CustomizedHandler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")
		// w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// handle 401
		userId := 1

		handler(w, r, db, userId)
	})
}
