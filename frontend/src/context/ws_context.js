'use client'

import { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [worker, setWorker] = useState(null);
    const [message, setMessage] = useState(null);
    const [status, setStatus] = useState('disconnected');

    useEffect(() => {
        const newWorker = new SharedWorker('/worker/web_worker.js');
        setWorker(newWorker);

        newWorker.port.onmessage = (event) => {
            console.log(event);
            
            const { type, data } = event.data;
            switch (type) {
                case 'connected':
                    setStatus('connected');
                    break;
                case 'disconnected':
                    setStatus('disconnected');
                    break;
                case 'message':
                    setMessage(data);
                    break;
                case 'error':
                    console.error('WebSocket Error:', data);
                    break;
                default:
                    break;
            }
        };

        newWorker.port.start();

        return () => {
            newWorker.port.close();
        };
    }, []);

    const sendMessage = (msg) => {
        if (worker) {
            worker.port.postMessage(msg);
        }
    };

    return (
        <WebSocketContext.Provider value={{ status, message, sendMessage }}>
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
