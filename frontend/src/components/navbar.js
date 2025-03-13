import Link from 'next/link';
import { BellIcon, CommentIcon, UserIcon } from '@/components/icons';
import { useState } from 'react';
import Notif from './notification';

const Navigation = () => {
    const [show, setDisplay] = useState(false);
    const notifications = [
        "You have a new follower",
        "Your post got a like",
        "Someone commented on your post",
    ];
    //we can change this notification format yo what ever is easier to get from the backend this is just an example as u asked me for 

    return (
        <nav className="main-nav">
            <div className="logo">SocialNet</div>
            <div className="nav-search">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="nav-icons">
                <div className="nav-icon notification-icon" onClick={() => setDisplay(!show)}>
                    <BellIcon />
                    <span className="notification-count">3</span>
                </div>
                {show && <Notif notifications={notifications} />}
                
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
