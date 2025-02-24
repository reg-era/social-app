package server

import (
	"database/sql"
	"net/http"
)

type costumizedHandler func(http.Request, http.Response)

var handlers = map[string]http.Handler{
	// "api/":
	// "POST api/ws":
	// "POST api/user":
	// "GET api/user/:username":
	// "POST api/post":
	// "GET api/post/:id":
	// "POST GET api/comment":
	// "POST api/group":
	// "GET api/group/:name":
}

func NewRouter(db *sql.DB) *http.ServeMux {
	mux := http.NewServeMux()

	// for endPoint, handler := range handlers {
	// mux.Handle(endPoint, middleware.MiddleWare(w, r, db, handler))
	// }

	return mux
}
