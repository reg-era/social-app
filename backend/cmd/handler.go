package server

import (
	"database/sql"
	"net/http"

	"social/core"
	"social/pkg/middleware"
)

var handlers = map[string]middleware.CustomizedHandler{
	"/api/user":    core.HandleUser,
	"/api/post":    core.HandlePost,
	"/api/comment": core.HandleComment,
	"/api/group":   core.HandleGroup,
	"/api/ws":      core.HandleWS,
}

func NewRouter(db *sql.DB) *http.ServeMux {
	mux := http.NewServeMux()

	for endpoint, handler := range handlers {
		mux.Handle(endpoint, middleware.MiddleWare(db, handler))
	}

	return mux
}
