"use client";

import { useState } from "react";

const EventResponseButtons = ({ eventId, userResponse, onResponseChange }) => {
    const [response, setResponse] = useState(userResponse || "");

    const handleResponse = async (newResponse) => {
        try {
            const res = await fetch("http://127.0.0.1:8080/api/event/respond", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": document.cookie.slice("auth_session=".length),
                },
                body: JSON.stringify({ event_id: eventId, response: newResponse }),
            });

            if (res.ok) {
                setResponse(newResponse);
                onResponseChange(newResponse);
            } else {
                throw new Error("Failed to respond to event");
            }
        } catch (error) {
            console.log("Error responding to event:", error);
        }
    };

    return (
        <div className="event-response-buttons">
            <button
                onClick={() => handleResponse("going")}
            >
                ✅ Going
            </button>
            <button
                onClick={() => handleResponse("not_going")}
            >
                ❌ Not Going
            </button>
        </div>
    );
};

export default EventResponseButtons;
