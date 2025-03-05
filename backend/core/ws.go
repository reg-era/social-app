package core

import (
	"fmt"
	"net/http"
)

func HandleWS(w http.ResponseWriter, r *http.Request) {
	userId := 01
	fmt.Fprintf(w, "Handling WebSocket endpoint for user %d", userId)
}
