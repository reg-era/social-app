package core

import (
	"database/sql"
	"fmt"
	"net/http"
)

func HandlePost(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Fprintf(w, "post for user %d", userId)
}
