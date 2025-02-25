package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

// creating the database
func Init() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "data/data.db")
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
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
func Read(db *sql.DB, query string, args ...any) (*sql.Row, error) {
	row := db.QueryRow(query, args...)
	return row, nil
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
