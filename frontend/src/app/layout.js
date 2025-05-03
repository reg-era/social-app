'use client'

import { useRouter } from 'next/navigation';
import { WebSocketProvider } from '@/context/ws_context';
import { AuthProvider } from '@/context/auth_context';
import '../style/home.css';

export default function Layout({ children }) {
    const router = useRouter();

    console.log('ldoododo: ', router.pathname); // why this is always undifned
    if (router.pathname === '/login' || router.pathname === '/signup') {
        return (
            <html>
                <body>
                    {children}
                </body>
            </html>
        );
    }

    return (
        <AuthProvider>
            <WebSocketProvider>
                <html>
                    <body>
                        {children}
                    </body>
                </html>
            </WebSocketProvider>
        </AuthProvider>
    );
}