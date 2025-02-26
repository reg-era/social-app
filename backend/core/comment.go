package core

import (
	"database/sql"
	"fmt"
	"net/http"
)

func HandleComment(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Fprintf(w, "comment for user %d", userId)
}
