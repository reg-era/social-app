"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth_context";
import { CheckIcon, CrossIcon } from "@/utils/icons";

const EventResponseButtons = ({ eventId, userResponse, onResponseChange }) => {
    const { token } = useAuth();
    const [response, setResponse] = useState(userResponse || "");

    const handleResponse = async (newResponse) => {
        try {
            const finalResponse = response === newResponse ? "" : newResponse;
            
            const res = await fetch("http://127.0.0.1:8080/api/event/respond", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
                body: JSON.stringify({ 
                    event_id: eventId, 
                    response: finalResponse 
                }),
            });

            if (res.ok) {
                setResponse(finalResponse); 
                onResponseChange(finalResponse);
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
                className={response === "going" ? "active" : ""}
                onClick={() => handleResponse("going")}
            >
                <CheckIcon /> Going
            </button>
            <button
                className={response === "not_going" ? "active" : ""}
                onClick={() => handleResponse("not_going")}
            >
                <CrossIcon /> Not Going
            </button>
        </div>
    );
};

export default EventResponseButtons;
