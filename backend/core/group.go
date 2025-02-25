package core

import (
	"database/sql"
	"fmt"
	"net/http"
)

func HandleGroup(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Fprintf(w, "new group for user %d", userId)
}
