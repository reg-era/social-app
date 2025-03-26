'use client'

import { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [websocket, setWebSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const url = new URL('ws://localhost:8080/api/ws')
        url.searchParams.append('auth', document.cookie.slice('auth_session='.length));

        const ws = new WebSocket(url.toString());
        setWebSocket(ws);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            console.log('Message received:', JSON.parse(event.data));
        };

        ws.onclose = (event) => {
            console.log('WebSocket Closed', event.code);
            alert("websocket to server is closed")
            setConnected(false);
        };

        return () => {
            ws.close()
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ websocket, connected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
