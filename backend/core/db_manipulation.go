package core

import (
	"database/sql"
	"log"
)

// use this function to create into a a
func (a *API) Create(query string, args ...any) (int64, error) {
	result, err := a.DB.Exec(query, args...)
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

// use this function to reade from a a
func (a *API) Read(query string, args ...any) *sql.Row {
	row := a.DB.QueryRow(query, args...)
	return row
}

func (a *API) ReadAll(query string, args ...any) (*sql.Rows, error) {
	rows, err := a.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	return rows, nil
}

// use this function to update in a
func (a *API) Update(query string, args ...any) (int64, error) {
	result, err := a.DB.Exec(query, args...)
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
