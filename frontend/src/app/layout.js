import { WebSocketProvider } from '@/context/ws_context'
import '../style/home.css'

export default function Layout({ children }) {
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