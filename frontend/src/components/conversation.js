import { SendIcon } from '@/components/icons';
import { useState, useEffect } from 'react';

const Conversation = ({ email, username }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const getMessages = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8080/api/chat?target=${email}&page=0`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.reverse())
            }
        } catch (err) {
            console.error("getting conversation: ", err);
        }
    }

    const sendMessage = async () => {
        if (newMessage == '') return
        try {
            const msg = {
                content: newMessage,
                email_receiver: email,
                create_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
            }
            const res = await fetch(`http://127.0.0.1:8080/api/chat?target=${email}&page=0`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                method: 'POST',
                body: JSON.stringify(msg)
            });
            if (res.ok) {
                setNewMessage('')
                setMessages([...messages, msg])
            }
        } catch (err) {
            console.error("getting conversation: ", err);
        }
    }

    useEffect(() => {
        setMessages([])
        getMessages()
    }, [email])

    return (
        <div className="chat-content">
            <div className="chat-header">
                <div className="chat-user-details">
                    <div className="user-avatar"></div>
                    <div className="chat-user-name">{username}</div>
                </div>
                <div className="chat-options"></div>
            </div>
            <div className="messages-container">
                {messages.map((message, index) => {
                    return (
                        <div key={index} className={`message ${(email == message.email_receiver) ? "sent" : "received"}`}>
                            <div className="message-content">
                                <p>{message.content}</p>
                                <span className="message-time">{message.create_at}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="message-input-container">
                <input type="text" value={newMessage} placeholder="Type a message..." onChange={(e) => setNewMessage(e.target.value)} />
                <button className="send-button" onClick={sendMessage}>
                    <SendIcon />
                </button>
            </div>
        </div>
    )
}

// <div className="message-date-separator">Today</div> 
export default Conversation;