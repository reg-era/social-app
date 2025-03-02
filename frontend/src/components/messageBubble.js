import React from 'react';

const MessageBubble = ({ content, time, isSent }) => {
    return (
        <div className={`message ${isSent ? 'sent' : 'received'}`}>
            <div className="message-content">
                <p>{content}</p>
                <span className="message-time">{time}</span>
            </div>
        </div>
    );
};

export default MessageBubble;