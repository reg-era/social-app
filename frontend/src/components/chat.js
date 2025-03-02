// File: MultipleFiles/Chat.js

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import MessageBubble from './messageBubble.js';

const Chat = ({ users }) => {
    const [selectedUser , setSelectedUser ] = useState(null);  // Initialize with null (no user selected)
    const [messages, setMessages] = useState([]); // Initialize with an empty array
    const [messageText, setMessageText] = useState('');
    /* 
    const handleUser Select = (userId) => {
        setSelectedUser (userId);
    };
    */

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageText.trim()) {
            const newMessage = {
                content: messageText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSent: true,
            };
            setMessages([...messages, newMessage]); // Add the new message to the list
            setMessageText(''); // Clear the input field
        }
    };

    return (
        <div className="chat-container">
            {selectedUser  ? (
                <>
                    <div className="chat-header">
                        <div className="chat-user-details">
                            <div className="user-avatar"></div>
                            <div className="chat-user-name">
                                {users.find(u => u.id === selectedUser )?.name}
                            </div>
                        </div>
                        <div className="chat-options">
                            <FontAwesomeIcon icon={faEllipsisH} />
                        </div>
                    </div>
                    <div className="messages-container">
                        <div className="message-date-separator">Today</div>
                        {messages.map((msg, index) => (
                            <MessageBubble 
                                key={index}
                                content={msg.content}
                                time={msg.time}
                                isSent={msg.isSent}
                            />
                        ))}
                    </div>
                    <div className="message-input-container">
                        <form onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Type a message..." 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                            />
                            <button type="submit" className="send-button">
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="no-conversation-selected">
                    <div className="no-conversation-icon">
                        <FontAwesomeIcon icon={faComment} size="3x" />
                    </div>
                    <h3>Select a conversation</h3>
                    <p>Choose from your existing conversations or start a new one</p>
                </div>
            )}
        </div>
    );
};

export default Chat;