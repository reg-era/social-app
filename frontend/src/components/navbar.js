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
                    <span className="notification-count">3</span>
                </div>
                <div className="nav-icon messages-icon">
                    <Link href="/chat" className="nav-icon messages-icon">
                        <span className="messages-count">4</span>
                    </Link>
                </div>
                <div className="nav-icon profile-thumbnail">
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
