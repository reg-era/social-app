'use client';

import '@/style/chat.css';
import '@/style/home.css';

import Navigation from '@/components/navbar';
import BackHome from '@/components/back_home';

import { useState } from 'react';

const ChatPage = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    const users = [
        { id: 1, name: 'TIKCHBILA', status: 'online', time: '10:30 AM', unread: 2 },
        { id: 2, name: 'TIWLIWLA', status: 'offline', time: 'Yesterday', unread: 0 },
        { id: 3, name: 'L33VVAK', status: 'online', time: '09:15 AM', unread: 1 },
        { id: 4, name: 'CHIWA7ED', status: 'online', time: '11:45 AM', unread: 3 },
    ];

    return (
        <div>
            <Navigation />
            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="chat-users-list">
                        {users.map(user => (
                            <div key={user.id} className={`chat-user-item`} onClick={() => setSelectedUser(user.id)}>
                                <div className="user-avatar"></div>
                                <div className="chat-user-info">
                                    <div className="chat-user-top">
                                        <div className="chat-user-name">{user.name}</div>
                                        <div className="chat-message-time">{user.time}</div>
                                    </div>
                                    <div className="chat-user-bottom">
                                        <div className="chat-last-message">{user.lastMessage}</div>
                                        {user.unread > 0 && (
                                            <div className="chat-unread-count">{user.unread}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-content">
                    {selectedUser ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-user-details">
                                    <div className="user-avatar"></div>
                                    <div className="chat-user-name">
                                        {users.find(u => u.id === selectedUser)?.name}
                                    </div>
                                </div>
                                <div className="chat-options">
                                </div>
                            </div>
                            <div className="messages-container">
                                <div className="message-date-separator">Today</div>
                                <div className="message received">
                                    <div className="message-content">
                                        <p>Hey there! How's it going?</p>
                                        <span className="message-time">10:30 AM</span>
                                    </div>
                                </div>
                                <div className="message sent">
                                    <div className="message-content">
                                        <p>I'm doing great, thanks for asking! How about you?</p>
                                        <span className="message-time">10:32 AM</span>
                                    </div>
                                </div>
                                <div className="message received">
                                    <div className="message-content">
                                        <p>Pretty good! I was wondering if you'd like to meet up this weekend?</p>
                                        <span className="message-time">10:34 AM</span>
                                    </div>
                                </div>
                            </div>
                            <div className="message-input-container">
                                <input type="text" placeholder="Type a message..." />
                                <button className="send-button">send</button>
                            </div>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <h3>Select a conversation</h3>
                            <p>Choose from your existing conversations or start a new one</p>
                        </div>
                    )}
                </div>
            </div>

            <BackHome/>
        </div>
    );
};

export default ChatPage;