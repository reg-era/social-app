'use client'

import { useRouter } from 'next/navigation';
import { WebSocketProvider } from '@/context/ws_context'
import '../style/home.css'

export default function Layout({ children }) {
    const router = useRouter();

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
        <WebSocketProvider>
            <html>
                <body>
                    {children}
                </body>
            </html>
        </WebSocketProvider>
    )
}