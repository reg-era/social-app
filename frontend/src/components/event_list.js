"use client";

import EventCard from "./event";

const EventList = ({ events }) => {
    return (
        <div className="event-list">
            {events && events.length > 0 ? (
                events.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
                <p>No events available.</p>
            )}
        </div>
    );
};

export default EventList;