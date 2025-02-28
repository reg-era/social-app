import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faComment, faUser } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

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
                <div className="nav-icon messages-icon">
                    <Link href="/chat" className="nav-icon messages-icon">
                        <FontAwesomeIcon icon={faComment} />
                        <span className="messages-count">4</span>
                    </Link>
                </div>
                <div className="nav-icon profile-thumbnail">
                    <FontAwesomeIcon icon={faUser} />
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
