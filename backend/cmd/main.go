package main

import (
	"log"
	"net/http"
	"os"
	"strings"

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

	router.HandleFunc("/api/global/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.Error(w, "page not found -_-", http.StatusNotFound)
			return
		}
		fs := http.FileServer(http.Dir("data/global/"))
		http.StripPrefix("/api/global/", fs).ServeHTTP(w, r)
	})

	handlers := map[string]middleware.CustomizedHandler{
		"/api/":        nil,
		"/api/user":    core.HandleUser,
		"/api/post":    core.HandlePost,
		"/api/comment": core.HandleComment,
		"/api/group":   core.HandleGroup,
		"/api/ws":      core.HandleWS,
	}

	for endpoint, handler := range handlers {
		router.Handle(endpoint, middleware.MiddleWare(dataConn, handler))
	}

	log.Print("Ready to run server on 127.0.0.1:" + port)
	if err := http.ListenAndServe("127.0.0.1:"+port, router); err != nil {
		log.Fatalf("Server failed: %v\n", err)
	}
}
