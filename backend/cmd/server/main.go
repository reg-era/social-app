package main

import (
	"log"
	"net/http"
	"os"

	"social/pkg/db"
	"social/cmd"
)

func main() {
	port := os.Getenv("PORT")

	dataConn, err := db.InitDB()
	if err != nil {
		log.Fatalf("initialize database faild: %v\n", err)
	}

	router := server.NewRouter(dataConn)

	log.Print("Ready to run server on 127.0.0.1:" + port)
	if err := http.ListenAndServe("127.0.0.1:"+port, router); err != nil {
		log.Fatalf("Server failed: %v\n", err)
	}
}
