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
	db, err := sql.Open("sqlite3", "data/data.db")
	if err != nil {
		return nil, fmt.Errorf("Creating db: %v", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("Pinging to db: %v", err)
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

// use this function to create into a db
func Create(db *sql.DB, query string, args ...any) (int64, error) {
	result, err := db.Exec(query, args...)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return 0, err
	}

	lastID, err := result.LastInsertId()
	if err != nil {
		log.Printf("Error getting last insert ID: %v", err)
		return 0, err
	}

	return lastID, nil
}

// use this function to reade from a db
func Read(db *sql.DB, query string, args ...any) (*sql.Row) {
	row := db.QueryRow(query, args...)
	return row
}

func ReadAll(db *sql.DB, query string, args ...any) (*sql.Rows, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	return rows, nil
}

// use this function to update in db
func Update(db *sql.DB, query string, args ...any) (int64, error) {
	result, err := db.Exec(query, args...)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return 0, err
	}

	affectedRows, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error getting affected rows: %v", err)
		return 0, err
	}

	return affectedRows, nil
}
