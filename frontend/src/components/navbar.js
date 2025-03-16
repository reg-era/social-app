import Link from 'next/link';
import { BellIcon, CommentIcon, UserIcon } from '@/components/icons';
import { useState, useRef, useEffect } from 'react';
import Notif from './notification';

const Navigation = () => {
    const [show, setDisplay] = useState(false);
    const [result, setDisplayResult] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [keyWord, setKeyword] = useState('');
    const typingTimeout = useRef(null);
    const searchRef = useRef(null);

    const handleSearch = async (e) => {
        setKeyword(e.target.value);
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(async () => {
            if (!e.target.value.trim()) {
                setSearchResults([]);
                setDisplayResult(false);
                return;
            }
            try {
                const res = await fetch(`http://127.0.0.1:8080/api/search?target=${e.target.value}`, {
                    headers: {
                        'Authorization': document.cookie.slice('auth_session='.length),
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                    setDisplayResult(true);
                }
            } catch (err) {
                console.error("Error: ", err);
            }
        }, 300);
    };

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setDisplayResult(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="main-nav">
            <div className="logo">SocialNet</div>
            <div className="nav-search" ref={searchRef}>
                <input type="text" value={keyWord} onChange={handleSearch} placeholder="Search..." onFocus={() => setDisplayResult(true)}/>
                {result && (
                    <div className="search-dropdown">
                        {searchResults.length > 0 ? (
                            searchResults.map((user, index) => (
                                <div key={index} className="search-item">
                                    <img src={user.avatarUrl || '/default-avatar.png'} alt={user.firstName} className="search-avatar" />
                                    <div className="search-info">
                                        <p>{user.firstName} {user.lastName}</p>
                                        <span>{user.email}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-results">No results found</p>
                        )}
                    </div>
                )}
            </div>
            <div className="nav-icons">
                <div className="nav-icon notification-icon" onClick={() => setDisplay(!show)}>
                    <BellIcon />
                    <span className="notification-count">3</span>
                </div>
                {show && <Notif notifications={["You have a new follower", "Your post got a like", "Someone commented on your post"]} />}

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