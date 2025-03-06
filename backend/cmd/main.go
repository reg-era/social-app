package main

import (
	"log"
	"net/http"
	"os"

	"social/core"
	data "social/pkg/db"
	"social/pkg/middleware"
	"social/pkg/utils"
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

	// public
	router.HandleFunc("/api/login", api.HandleLogin)
	router.HandleFunc("/api/user", api.HandleUser)
	router.Handle("/api/check", mw.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		utils.RespondWithJSON(w, http.StatusUnauthorized, map[string]string{"succes": "valid user"})
	}))

	// private
	router.Handle("/api/global/", mw.AuthMiddleware(http.HandlerFunc(api.UploadeImages)))
	router.Handle("/api/post", mw.AuthMiddleware(http.HandlerFunc(api.HandlePost)))
	router.Handle("/api/comment", mw.AuthMiddleware(http.HandlerFunc(api.HandleComment)))
	router.Handle("/api/group", mw.AuthMiddleware(http.HandlerFunc(api.HandleGroup)))
	router.Handle("/api/follow", mw.AuthMiddleware(http.HandlerFunc(api.HandleFollow)))

	log.Printf("Server running on http://127.0.0.1:%s\n", port)
	if err := http.ListenAndServe("127.0.0.1:"+port, middleware.CORS(router)); err != nil {
		log.Fatalf("Server failed: %v\n", err)
	}
}
