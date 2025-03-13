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

	api := &core.API{
		DB:  db,
		HUB: core.NewWebSocketHub(),
	}
	mw := &middleware.API{API: api}

	router := http.NewServeMux()

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		utils.RespondWithJSON(w, http.StatusOK, map[string]string{
			"message": "Server is running. Welcome to the Social Network API.",
			"status":  "OK",
		})
	})

	// public
	router.HandleFunc("POST /api/login", api.HandleLogin)
	router.HandleFunc("POST /api/signin", api.HandleSignin)
	router.Handle("/api/check", mw.AuthMiddleware(nil))

	// private
	router.Handle("GET /api/user", mw.AuthMiddleware(http.HandlerFunc(api.HandleUser)))
	router.Handle("GET /api/global/", mw.AuthMiddleware(http.HandlerFunc(api.UploadeImages)))
	router.Handle("GET /api/search", mw.AuthMiddleware(http.HandlerFunc(api.HandleSearch)))
	router.Handle("/api/follow", mw.AuthMiddleware(http.HandlerFunc(api.HandleFollow)))
	router.Handle("/api/post", mw.AuthMiddleware(http.HandlerFunc(api.HandlePost)))
	router.Handle("/api/comment", mw.AuthMiddleware(http.HandlerFunc(api.HandleComment)))
	router.Handle("/api/chat", mw.AuthMiddleware(http.HandlerFunc(api.HandleChat)))
	router.Handle("/api/group", mw.AuthMiddleware(http.HandlerFunc(api.HandleGroup)))
	router.Handle("GET /api/notif", mw.AuthMiddleware(http.HandlerFunc(api.HandleNotif)))
	router.Handle("/api/ws", mw.AuthMiddleware(http.HandlerFunc(api.WebSocketConnect)))
	router.Handle("POST /api/change-vis", mw.AuthMiddleware(http.HandlerFunc(api.HandleVisibilityChange)))

	// run hub channels listner
	go api.HUB.RunHubListner()

	log.Printf("Server running on http://127.0.0.1:%s\n", port)
	if err := http.ListenAndServe("127.0.0.1:"+port, middleware.CORS(router)); err != nil {
		log.Fatalf("Server failed: %v\n", err)
	}
}
