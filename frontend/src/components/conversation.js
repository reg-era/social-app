import { SendIcon } from '@/utils/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile } from '@fortawesome/free-solid-svg-icons';

import { useWebSocket } from '@/context/ws_context';
import { useState, useEffect, useRef } from 'react';
import { EMOJI_CATEGORIES } from '@/utils/emoji';
import { useAuth } from '@/context/auth_context';

const Conversation = ({ email, username, imageProfUrl }) => {
    const { token, loading } = useAuth();
    const { websocket, connected } = useWebSocket();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isFinale, setFinal] = useState(false);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messageSectionRef = useRef(null);
    const topMessageRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const currentEmailRef = useRef(email);

    useEffect(() => {
        setMessages([]);
        setPage(0);
        setFinal(false);
        setIsLoading(false);
        currentEmailRef.current = email;

        fetchMessages(0, true);

        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [email]);

    useEffect(() => {
        if (!websocket || !connected) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.email_sender === email || data.email_receiver === email) {
                setMessages(prev => [...prev, data]);

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        if (messageSectionRef.current) {
                            messageSectionRef.current.scrollTop = messageSectionRef.current.scrollHeight;
                        }
                    }
                    )
                }, 0);
            }
        };

        websocket.addEventListener('message', handleMessage);
        return () => websocket.removeEventListener('message', handleMessage);
    }, [websocket, connected, email]);

    useEffect(() => {
        if (!topMessageRef.current || messages.length === 0 || isFinale) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading && !isFinale) {
                    setPage(prev => prev + 1);
                }
            },
            { root: messageSectionRef.current, threshold: 0.5 }
        );

        observer.observe(topMessageRef.current);
        return () => observer.disconnect();
    }, [messages, isLoading, isFinale]);

    useEffect(() => {
        if (page > 0) {
            fetchMessages(page, false);
        }
    }, [page]);

    const fetchMessages = async (pageNum, isNewConversation) => {
        if (loading && isLoading || (isFinale && !isNewConversation)) return;

        setIsLoading(true);
        const targetEmail = currentEmailRef.current;

        try {
            const previousScrollHeight = messageSectionRef.current?.scrollHeight || 0;

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/chat?target=${targetEmail}&page=${pageNum}`, {
                headers: { 'Authorization': token },
            });

            if (targetEmail !== currentEmailRef.current) {
                setIsLoading(false);
                return;
            }

            if (res.ok) {
                const data = await res.json();

                if (isNewConversation) {
                    setMessages(data.reverse());
                } else {
                    const revers_data = data.reverse()
                    setMessages(prev => [...revers_data, ...prev]);
                }

                if (data.length < 5) {
                    setFinal(true);
                }

                requestAnimationFrame(() => {
                    if (messageSectionRef.current) {
                        if (!isNewConversation) {
                            const newScrollHeight = messageSectionRef.current.scrollHeight;
                            messageSectionRef.current.scrollTop = newScrollHeight - previousScrollHeight;
                        } else {
                            messageSectionRef.current.scrollTop = messageSectionRef.current.scrollHeight;
                        }
                    }
                });
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker);

    const insertEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };

    const sendMessage = async () => {
        if (newMessage.trim() === '') return;

        try {
            const msg = {
                content: newMessage,
                email_receiver: email,
                create_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
            };

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/chat?target=${email}`, {
                headers: { 'Authorization': token },
                method: 'POST',
                body: JSON.stringify(msg)
            });

            if (res.ok) {
                setNewMessage('');
                if (messageSectionRef.current) {
                    messageSectionRef.current.scrollTop = messageSectionRef.current.scrollHeight;
                }
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="chat-content">
            <div className="chat-header">
                <div className="chat-user-details">
                    <div className="user-avatar" style={{
                        backgroundImage: `url(${imageProfUrl})`,
                        backgroundSize: 'cover'
                    }}></div>
                    <div className="chat-user-name">{username}</div>
                </div>
                <div className="chat-options"></div>
            </div>
            <div ref={messageSectionRef} className="messages-container">
                {/* <div className="message-date-separator">Today</div> */}
                {messages.map((message, index) => {
                    return (
                        <div ref={index === 0 ? topMessageRef : null} key={index} className={`message ${(email == message.email_receiver) ? "sent" : "received"}`}>
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

                {showEmojiPicker && (
                    <div className="emoji-picker-container" ref={emojiPickerRef}>
                        <div className="emoji-list">
                            {EMOJI_CATEGORIES.smileys.map((emoji, index) => (
                                <span key={index} className="emoji-item" onClick={() => insertEmoji(emoji)}>{emoji}</span>
                            ))}
                        </div>
                    </div>
                )}

                <button type="button" className="emoji-action" onClick={toggleEmojiPicker}>
                    <FontAwesomeIcon icon={faSmile} />
                </button>
                <button className="send-button" onClick={sendMessage}>
                    <SendIcon />
                </button>
            </div>
        </div>
    )
}

export default Conversation;