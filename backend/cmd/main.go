package main

import (
	"log"
	"net/http"
	"os"

	"social/core"
	data "social/pkg/db"
	"social/pkg/middleware"
)

func main() {
	port := os.Getenv("PORT")

	dataConn, err := data.Init()
	if err != nil {
		log.Fatalf("initialize database faild: %v\n", err)
	}

	router := http.NewServeMux()

	handlers := map[string]middleware.CustomizedHandler{
		"/api/user":    core.HandleUser,
		"/api/post":    core.HandlePost,
		"/api/comment": core.HandleComment,
		"/api/group":   core.HandleGroup,
		"/api/ws":      core.HandleWS,
		"/api/":        nil,
	}

	for endpoint, handler := range handlers {
		router.Handle(endpoint, middleware.MiddleWare(dataConn, handler))
	}

	log.Print("Ready to run server on 127.0.0.1:" + port)
	if err := http.ListenAndServe("127.0.0.1:"+port, router); err != nil {
		log.Fatalf("Server failed: %v\n", err)
	}
}
