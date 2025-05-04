"use client";

import { useState, useEffect } from "react";
import EventResponseButtons from "./event_buttons";
import { useAuth } from "@/context/auth_context";
import { timeAgo } from "@/utils/helper";

const EventCard = ({ event }) => {
    const { token, loading } = useAuth();

    const [eventDetails, setEventDetails] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8080/api/event/details?event_id=${event.id}`, {
                    headers: { "Authorization": token },
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
    }, [event.id, loading, token]);

    const handleResponseChange = (newResponse) => {
        if (eventDetails && !eventDetails.is_passed) {
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
            <p><strong>Date:</strong> {timeAgo(event.event_date)}</p>
            <p><strong>Created By:</strong> {eventDetails ? 
                `${eventDetails.creator_first_name} ${eventDetails.creator_last_name}` : 
                'Loading...'}
            </p>
            {eventDetails && (
                <>
                    {eventDetails.is_passed ? (
                        <p className="event-status">This event has passed.</p>
                    ) : (
                        <>
                            <p><strong>Going:</strong> {eventDetails.going_count}</p>
                            <p><strong>Not Going:</strong> {eventDetails.not_going_count}</p>
                            <EventResponseButtons
                                eventId={event.id}
                                userResponse={eventDetails.user_response}
                                onResponseChange={handleResponseChange}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default EventCard;
