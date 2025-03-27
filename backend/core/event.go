package core

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social/pkg/utils"
	"strconv"
)

type EventResponse struct {
	EventID  int    `json:"event_id"`
	Response string `json:"response"`
}

type Event struct {
	ID          int    `json:"id"`
	GroupID     int    `json:"group_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CreatorID   int    `json:"creator_id"`
	EventDate   string `json:"event_date"`
	CreatedAt   string `json:"created_at"`
}

type EventDetails struct {
	ID            int    `json:"id"`
	GroupID       int    `json:"group_id"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	CreatorID     int    `json:"creator_id"`
	EventDate     string `json:"event_date"`
	CreatedAt     string `json:"created_at"`
	GoingCount    int    `json:"going_count"`
	NotGoingCount int    `json:"not_going_count"`
	UserResponse  string `json:"user_response"`
}

func (a *API) HandleCreateEvent(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userID").(int)
	var event struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		EventDate   string `json:"event_date"`
		GroupID     string    `json:"group_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		fmt.Println(err)
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		return
	}

	var memberStatus string
	err := a.Read(`SELECT status FROM group_members 
		WHERE group_id = ? AND user_id = ?`,
		event.GroupID, userId).Scan(&memberStatus)
	if err != nil || memberStatus != "accepted" {
		utils.RespondWithJSON(w, http.StatusForbidden,
			map[string]string{"error": "Not a group member"})
		return
	}

	eventID, err := a.Create(
		`INSERT INTO events (title, description, event_date, group_id, creator_id)
		VALUES (?, ?, ?, ?, ?)`,
		event.Title, event.Description, event.EventDate, event.GroupID, userId,
	)
	if err != nil {
		fmt.Println("Failed to create event:", err)
		utils.RespondWithJSON(w, http.StatusInternalServerError,
			map[string]string{"error": "Failed to create event"})
		return
	}

	fmt.Println("event created")
	utils.RespondWithJSON(w, http.StatusCreated, EventResponse{EventID: int(eventID), Response: "Event created successfully"})
}

func (a *API) HandleGetEvents(w http.ResponseWriter, r *http.Request) {
	groupIDStr := r.URL.Query().Get("group_id")
	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid group ID"})
		return
	}

	rows, err := a.ReadAll(`
		SELECT id, group_id, title, description, creator_id, event_date, created_at 
		FROM events 
		WHERE group_id = ?`, groupID)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch events"})
		return
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var event Event
		if err := rows.Scan(&event.ID, &event.GroupID, &event.Title, &event.Description, 
			&event.CreatorID, &event.EventDate, &event.CreatedAt); err != nil {
			utils.RespondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to scan event"})
			return
		}
		events = append(events, event)
	}

	utils.RespondWithJSON(w, http.StatusOK, events)
}

func (a *API) HandleGetEventDetails(w http.ResponseWriter, r *http.Request) {
	eventIDStr := r.URL.Query().Get("event_id")
	eventID, err := strconv.Atoi(eventIDStr)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid event ID"})
		return
	}

	userID := r.Context().Value("userID").(int)

	var eventDetails EventDetails
	err = a.Read(`
		SELECT id, group_id, title, description, creator_id, event_date, created_at
		FROM events
		WHERE id = ?`, eventID).Scan(
		&eventDetails.ID, &eventDetails.GroupID, &eventDetails.Title, 
		&eventDetails.Description, &eventDetails.CreatorID, 
		&eventDetails.EventDate, &eventDetails.CreatedAt)
	
	if err != nil {
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "Event not found"})
		return
	}

	err = a.Read(`
		SELECT COUNT(*) FROM event_responses 
		WHERE event_id = ? AND response = 'going'`, eventID).Scan(&eventDetails.GoingCount)
	if err != nil {
		eventDetails.GoingCount = 0
	}

	err = a.Read(`
		SELECT COUNT(*) FROM event_responses 
		WHERE event_id = ? AND response = 'not_going'`, eventID).Scan(&eventDetails.NotGoingCount)
	if err != nil {
		eventDetails.NotGoingCount = 0
	}

	err = a.Read(`
		SELECT response FROM event_responses 
		WHERE event_id = ? AND user_id = ?`, eventID, userID).Scan(&eventDetails.UserResponse)
	if err != nil {
		eventDetails.UserResponse = ""
	}

	utils.RespondWithJSON(w, http.StatusOK, eventDetails)
}

func (a *API) HandleRespondToEvent(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	
	var request struct {
		EventID  int    `json:"event_id"`
		Response string `json:"response"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		return
	}
	
	if request.Response != "going" && request.Response != "not_going" {
		utils.RespondWithJSON(w, http.StatusBadRequest, 
			map[string]string{"error": "Response must be 'going' or 'not_going'"})
		return
	}
	
	var eventExists bool
	err := a.Read(`SELECT EXISTS(SELECT 1 FROM events WHERE id = ?)`, request.EventID).Scan(&eventExists)
	if err != nil || !eventExists {
		utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{"error": "Event not found"})
		return
	}
	
	var groupID int
	err = a.Read(`SELECT group_id FROM events WHERE id = ?`, request.EventID).Scan(&groupID)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, 
			map[string]string{"error": "Failed to get event details"})
		return
	}
	
	var memberStatus string
	err = a.Read(`SELECT status FROM group_members WHERE group_id = ? AND user_id = ?`,
		groupID, userID).Scan(&memberStatus)
	if err != nil || memberStatus != "accepted" {
		utils.RespondWithJSON(w, http.StatusForbidden,
			map[string]string{"error": "Not a group member"})
		return
	}
	
	_, err = a.Create(`
		INSERT INTO event_responses (event_id, user_id, response)
		VALUES (?, ?, ?)
		ON CONFLICT(event_id, user_id) DO UPDATE SET response = ?`,
		request.EventID, userID, request.Response, request.Response)
	
	if err != nil {
		utils.RespondWithJSON(w, http.StatusInternalServerError, 
			map[string]string{"error": "Failed to save response"})
		return
	}
	
	utils.RespondWithJSON(w, http.StatusOK, 
		map[string]string{"message": "Response saved successfully"})
}