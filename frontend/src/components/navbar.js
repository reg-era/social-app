import Link from 'next/link';
import { BellIcon, CommentIcon, UserIcon } from '@/components/icons';

const Navigation = () => {
    return (
        <nav className="main-nav">
            <div className="logo">SocialNet</div>
            <div className="nav-search">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="nav-icons">
                <div className="nav-icon notification-icon">
                    <BellIcon />
                    <span className="notification-count">3</span>
                </div>
                <Link href="/chat" className="nav-icon messages-icon">
                    <CommentIcon />
                    <span className="messages-count">5</span>
                </Link>
                <button className="nav-icon logout-btn">
                    <UserIcon />
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
