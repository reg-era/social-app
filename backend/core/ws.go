package core

import (
	"database/sql"
	"fmt"
	"net/http"
)

func HandleWS(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Fprintf(w, "Handling WebSocket endpoint for user %d", userId)
}
