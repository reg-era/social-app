"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth_context";

const CreateEventCard = ({ onCreateEvent, groupId }) => {
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [error, setError] = useState('');

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!title || !description || !eventDate) return;

        try {
            const res = await fetch("http://127.0.0.1:8080/api/event/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
                body: JSON.stringify({ title, description, event_date: eventDate, group_id: groupId }),
            });

            if (res.ok) {
                const data = await res.json();
                onCreateEvent(data);
                setTitle('');
                setDescription('');
                setEventDate('');
            } else {
                throw new Error("Failed to create event");
            }
        } catch (error) {
            console.log(error);
            setError("Failed to create event. Try again.");
        }
    };

    return (
        <form className="create-event-card" onSubmit={handleCreateEvent}>
            <div className="create-event-header">
                <input 
                    type="text" 
                    placeholder="Event Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea 
                    placeholder="Event Description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input 
                    type="datetime-local" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-button">Create Event</button>
            </div>
        </form>
    );
};

export default CreateEventCard;
