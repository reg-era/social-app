import { SendIcon } from '@/utils/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile } from '@fortawesome/free-solid-svg-icons';


import { useWebSocket } from '@/context/ws_context';
import { useState, useEffect, useRef } from 'react';
import { EMOJI_CATEGORIES } from '@/utils/emoji';
import { useAuth } from '@/context/auth_context';

const Conversation = ({ email, username, imageProfUrl }) => {
    const { token, loading } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const messageSectionRef = useRef(null);

    const [page, setPage] = useState(0);
    const [isThrottling, setIsThrottling] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const insertEmoji = (emoji) => {
        setNewMessage((prevmesage) => prevmesage + emoji);
    };

    const { websocket, connected } = useWebSocket();
    if (websocket && connected) {
        websocket.onmessage = (event) => {
            setMessages((prevMessages) => [...prevMessages, JSON.parse(event.data)]);
        };
    }

    const getMessages = async () => {
        console.log('fetching for: ', email, page)
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/chat?target=${email}&page=${page}`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.reverse());
                console.log(data)
                // setPage((prev) => prev + 1);
                setIsThrottling(false);
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
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/chat?target=${email}`, {
                headers: {
                    'Authorization': token,
                },
                method: 'POST',
                body: JSON.stringify(msg)
            });
            if (res.ok) {
                setNewMessage('');
                messageSectionRef.current.scrollTop = messageSectionRef.current.scrollHeight;
            }
        } catch (err) {
            console.error("getting conversation: ", err);
        }
    }

    const handleScroll = () => {
        if (isThrottling) return;

        const scrollHeight = messageSectionRef.current.scrollHeight;
        const scrollPosition = messageSectionRef.current.scrollTop + messageSectionRef.current.clientHeight;

        if (scrollPosition <= scrollHeight * 0.65) {
            console.log('Throttling scroll - loading older messages');
            setIsThrottling(true);

            setTimeout(async () => {
                await getMessages();
            }, 1000);
        }
    }

    useEffect(() => {
        setPage(0)
        !loading && getMessages()

        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        const messageContainer = messageSectionRef.current;
        if (messageContainer) {
            messageContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);

            if (messageContainer) {
                messageContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [email, loading])

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