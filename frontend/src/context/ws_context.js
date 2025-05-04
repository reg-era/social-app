'use client'

import { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [websocket, setWebSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const match = document.cookie.match(new RegExp(`(?:^|;\\s*)auth_session=([^;]+)`));
        const token_cookie = match ? match[1] : null;

        const url = new URL(`ws://${process.env.NEXT_PUBLIC_GOSERVER}/api/ws`)
        url.searchParams.append('auth', token_cookie);

        const ws = new WebSocket(url.toString());
        setWebSocket(ws);

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (event) => {
        };

        ws.onclose = (event) => {
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
