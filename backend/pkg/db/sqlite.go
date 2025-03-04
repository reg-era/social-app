package data

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	_ "github.com/mattn/go-sqlite3"
)

func Init() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "./data/data.db")
	if err != nil {
		return nil, fmt.Errorf("Creating a: %v", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("Pinging to a: %v", err)
	}

	m, err := migrate.New("file://pkg/db/migrations", "sqlite3://data/data.db")
	if err != nil {
		return nil, fmt.Errorf("Creating migration: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return nil, fmt.Errorf("Applying migrations: %v", err)
	} else {
		log.Println("Migrations applied successfully!")
	}

	return db, nil
}
