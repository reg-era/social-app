import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faComment, faSignOut } from '@fortawesome/free-solid-svg-icons';

const Navigation = () => {
    return (
        <nav className="main-nav">
            <div className="logo">SocialNet</div>
            <div className="nav-search">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="nav-icons">
                <div className="nav-icon notification-icon">
                    <FontAwesomeIcon icon={faBell} />
                    <span className="notification-count">3</span>
                </div>
                <Link href="/chat" className="nav-icon messages-icon">
                    <FontAwesomeIcon icon={faComment} />
                    <span className="messages-count">5</span>
                </Link>
                <button className="nav-icon logout-btn">
                    <FontAwesomeIcon icon={faSignOut} />
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
