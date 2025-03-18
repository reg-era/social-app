'use client';

import '@/style/chat.css';
import '@/style/home.css';

import Navigation from '@/components/navbar';
import BackHome from '@/components/back_home';

import { useEffect, useState } from 'react';
import Conversation from '@/components/conversation';

const ChatPage = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([])

    const getConversations = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8080/api/chat`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
            });
            if (res.ok) {
                const data = await res.json();
                // console.log(data);
                setUsers(data)
            }
        } catch (err) {
            console.error("getting conversation: ", err);
        }
    }


    useEffect(() => {
        getConversations()
    }, [])

    return (
        <div>
            <Navigation />
            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="chat-users-list">
                        {users.map(user => (
                            <div key={user.id} className={`chat-user-item`} onClick={() => setSelectedUser(user)}>
                                <div className="user-avatar"></div>
                                <div className="chat-user-info">
                                    <div className="chat-user-top">
                                        <div className="chat-user-name">{`${user.firstName} ${user.lastName}`}</div>
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
                {!selectedUser && <div className="chat-content">
                    <div className="no-conversation-selected">
                        <h3>Select a conversation</h3>
                        <p>Choose from your existing conversations or start a new one</p>
                    </div>
                </div>}
                {/* {console.log(selectedUser)} */}
                {selectedUser && <Conversation email={selectedUser.email} username={`${selectedUser.firstName} ${selectedUser.lastName}`} />}
            </div>

            <BackHome />
        </div>
    );
};

export default ChatPage;

