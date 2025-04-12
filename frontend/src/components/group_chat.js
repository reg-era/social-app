import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import { useAuth } from '@/context/auth_context';
import { useWebSocket } from '@/context/ws_context';

import { useState, useEffect, useRef } from 'react';

const GroupChat = ({ groupId, userId }) => {
    const { token, loading } = useAuth();
    const { websocket, connected } = useWebSocket();

    const [newChatMessage, setNewChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    const [isFinale, setFinal] = useState(false);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const messageSectionRef = useRef(null);
    const topMessageRef = useRef(null);
    const currentGroupRef = useRef(groupId);

    useEffect(() => {
        setChatMessages([]);
        setPage(0);
        setFinal(false);
        setIsLoading(false);
        currentGroupRef.current = groupId;

        fetchMessages(0, true);
    }, [groupId]);

    useEffect(() => {
        if (!websocket || !connected) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.group_id == groupId) {
                setChatMessages((prevMsg) => [...prevMsg, data]);

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
    }, [websocket, connected, groupId]);

    useEffect(() => {
        if (!topMessageRef.current || chatMessages.length === 0 || isFinale) return;

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
    }, [chatMessages, isLoading, isFinale]);

    useEffect(() => {
        if (page > 0) {
            fetchMessages(page, false);
        }
    }, [page]);

    const fetchMessages = async (pageNum, isNewConversation) => {
        if (loading && isLoading || (isFinale && !isNewConversation)) return;

        setIsLoading(true);
        const group_id = currentGroupRef.current;

        try {
            const previousScrollHeight = messageSectionRef.current?.scrollHeight || 0;

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/chat?target=group_${group_id}&page=${pageNum}`, {
                headers: { 'Authorization': token },
            });

            if (group_id !== currentGroupRef.current) {
                setIsLoading(false);
                return;
            }

            if (res.ok) {
                const data = await res.json();

                if (isNewConversation) {
                    setChatMessages(data.reverse());
                } else {
                    const revers_data = data.reverse()
                    setChatMessages(prev => [...revers_data, ...prev]);
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

    const sendMessage = async (e) => {
        try {
            e.preventDefault();
            if (newChatMessage.trim() === '') return;
            const msg = {
                content: newChatMessage,
                group_id: Number.parseInt(groupId),
                create_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
            };

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/chat?group=${groupId}`, {
                headers: { 'Authorization': token },
                method: 'POST',
                body: JSON.stringify(msg)
            });

            if (res.ok) {
                setNewChatMessage('');
                if (messageSectionRef.current) {
                    messageSectionRef.current.scrollTop = messageSectionRef.current.scrollHeight;
                }
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <>
            <div className={`group-chat-body`}>
                <div ref={messageSectionRef} className="group-chat-messages">
                    {chatMessages.map((message, index) => (
                        <div ref={index === 0 ? topMessageRef : null} key={index} className={`chat-message ${message.sender === userId ? 'sent' : 'received'}`}>
                            <div className="message-sender">{message.sender === userId ? 'You' : message.email_sender}</div>
                            <div className="message-content">
                                <div className="message-text">{message.content}</div>
                                <div className="message-time">{message.create_at}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <form className="group-chat-input" onSubmit={sendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                    />
                    <button type="submit" className="send-message-btn">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </form>
            </div>
        </>
    )
}


export default GroupChat;