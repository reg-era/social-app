'use client';

import '@/style/chat.css';
import '@/style/home.css';

import Navigation from '@/components/navbar';
import BackHome from '@/components/back_home';

import { useEffect, useState } from 'react';
import Conversation from '@/components/conversation';
import { useAuth } from '@/context/auth_context';
import { getDownloadImage } from '@/utils/helper';

const ChatPage = () => {
    const { token, loading } = useAuth();

    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([])

    const getConversations = async () => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/chat`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (res.ok) {
                const data = await res.json();
                data.forEach(async (user) => {
                    const downloaded = await getDownloadImage(user.avatarUrl, token)
                    user.avatarUrl = (downloaded === null) ? '/default_profile.jpg' : downloaded;
                });
                setUsers(data)
            }
        } catch (err) {
            console.error("getting conversation: ", err);
        }
    }

console.log("users: ", users);
    useEffect(() => {
        !loading && getConversations()
    }, [loading])

    return (
        <div>
            <Navigation />
            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="chat-users-list">
                        {users.map(user => (
                            <div key={user.id} className={`chat-user-item`} onClick={() => setSelectedUser(user)}>
                                <div className="user-avatar" style={{
                                    backgroundImage: `url(${user.avatarUrl})`,
                                    backgroundSize: 'cover'
                                }}></div>
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
                {selectedUser && <Conversation email={selectedUser.email} username={`${selectedUser.firstName} ${selectedUser.lastName}`} imageProfUrl={selectedUser.avatarUrl} />}
            </div>

            <BackHome />
        </div>
    );
};

export default ChatPage;

