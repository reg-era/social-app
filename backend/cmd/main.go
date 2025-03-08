package main

import (
	"log"
	"net/http"
	"os"
	"social/core"
	data "social/pkg/db"
	"social/pkg/middleware"
	"strings"
)

func main() {

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	db, err := data.Init()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v\n", err)
	}

	api := &core.API{DB: db}
	mw := &middleware.API{API: api}

	router := http.NewServeMux()

	router.HandleFunc("/api/global/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.Error(w, "page not found -_-", http.StatusNotFound)
			return
		}
		fs := http.FileServer(http.Dir("data/global/"))
		http.StripPrefix("/api/global/", fs).ServeHTTP(w, r)
	})
	
	//public
	//
	//
	router.HandleFunc("/api/login", api.HandleLogin)
	router.HandleFunc("/api/user", api.HandleUser)

	//private
	//
	//
	
	router.Handle("/api/post", mw.AuthMiddleware(http.HandlerFunc(api.HandlePost)))
	router.Handle("/api/comment", mw.AuthMiddleware(http.HandlerFunc(api.HandleComment)))
	
	// this handler is for changing the user from public to private
	router.Handle("/api/visibility", mw.AuthMiddleware(http.HandlerFunc(api.HandleVisibilityChange)))


	router.Handle("/api/group", mw.AuthMiddleware(http.HandlerFunc(api.HandleGroup)))
	// router.Handle("/api/group/join", mw.AuthMiddleware(http.HandlerFunc(api.HandleGroupJoin)))

	router.Handle("/api/follow", mw.AuthMiddleware(http.HandlerFunc(api.HandleFollow)))
	router.Handle("/api/follow/request", mw.AuthMiddleware(http.HandlerFunc(api.HandleFollowRequest)))

	handler := middleware.CORS(router)

	log.Printf("Server running on http://127.0.0.1:%s\n", port)
	if err := http.ListenAndServe("127.0.0.1:"+port, handler); err != nil {
		log.Fatalf("Server failed: %v\n", err)
	}
}
