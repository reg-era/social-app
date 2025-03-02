'use client';

import './chat.css'; // We'll create this file next
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, faComment, faUser, faHome, faUsers, faEllipsisH,
  faArrowLeft, faPaperPlane, faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Link from 'next/link';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Sample data - replace with your actual data
  const users = [
    { id: 1, name: 'TIKCHBILA', status: 'online', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'TIWLIWLA', status: 'offline', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'L33VVAK', status: 'online', time: '09:15 AM', unread: 1 },
    { id: 5, name: 'CHIWA7ED', status: 'online', time: '11:45 AM', unread: 3 },
  ];

  return (
    <div>
      <nav className="main-nav">
        <div className="logo">SocialNet</div>
        <div className="nav-search">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="nav-icons">
          <div className="nav-icon notification-icon">
            <FontAwesomeIcon icon={faBell} />
            <span className="notification-count">3</span>
          </div>
          <div className="nav-icon messages-icon">
            <FontAwesomeIcon icon={faComment} />
            <span className="messages-count">5</span>
          </div>
          <div className="nav-icon profile-thumbnail">
            <FontAwesomeIcon icon={faUser} />
          </div>
        </div>
      </nav>

      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Messages</h2>
            <div className="chat-search">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input type="text" placeholder="Search conversations..." />
            </div>
          </div>
          <div className="chat-users-list">
            {users.map(user => (
              <div 
                key={user.id} 
                className={`chat-user-item ${selectedUser === user.id ? 'active' : ''} ${user.status}`}
                onClick={() => setSelectedUser(user.id)}
              >
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
                  <FontAwesomeIcon icon={faEllipsisH} />
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
                <button className="send-button">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
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
      </div>
      
      <Link href="/home" className="back-to-home">
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};

export default ChatPage;