"use client";

import { useState, useEffect } from "react";
import EventResponseButtons from "./event_buttons";

const EventCard = ({ event }) => {
    const [eventDetails, setEventDetails] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8080/api/event/details?event_id=${event.id}`, {
                    headers: { "Authorization": document.cookie.slice("auth_session=".length) },
                });

                if (res.ok) {
                    const data = await res.json();
                    setEventDetails(data);
                }
            } catch (error) {
                console.log("Error fetching event details:", error);
            }
        };

        fetchEventDetails();
    }, [event.id]);


    const handleResponseChange = (newResponse) => {
        if (eventDetails) {
            let newDetails = { ...eventDetails };
            
            if (eventDetails.user_response === "going") {
                newDetails.going_count--;
            } else if (eventDetails.user_response === "not_going") {
                newDetails.not_going_count--;
            }

            if (newResponse === "going") {
                newDetails.going_count++;
            } else if (newResponse === "not_going") {
                newDetails.not_going_count++;
            }

            newDetails.user_response = newResponse; // !!!!!!!!!!! this would be empty string when unselecting
            setEventDetails(newDetails);
        }
    };

    return (
        <div className="event-card">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Date:</strong> {event.event_date}</p>
            <p><strong>Created By:</strong> {event.creator_id}</p>
            {eventDetails && (
                <>
                    <p><strong>Going:</strong> {eventDetails.going_count}</p>
                    <p><strong>Not Going:</strong> {eventDetails.not_going_count}</p>
                    <EventResponseButtons eventId={event.id} userResponse={eventDetails.user_response} onResponseChange={handleResponseChange} />
                </>
            )}
        </div>
    );
};

export default EventCard;
