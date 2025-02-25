package core

import (
	"database/sql"
	"fmt"
	"net/http"
)

func HandleUser(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Fprintf(w, "request for user %d", userId)
}
