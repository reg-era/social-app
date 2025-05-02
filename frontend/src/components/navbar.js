import Link from 'next/link';
import { useState, useRef, useEffect, useCallback} from 'react';

import { BellIcon, CommentIcon, LogOutIcon } from '@/utils/icons';
import Notif from './notification';
import { getDownloadImage } from '@/utils/helper';
import { useAuth } from '@/context/auth_context';
import { useWebSocket } from '@/context/ws_context';
import { useRouter } from 'next/navigation';
import { searchUsers } from '@/utils/api';

const Navigation = () => {
    const router = useRouter();
    const { token, loading } = useAuth();
    const { websocket, connected } = useWebSocket();

    const [notifications, setNotifications] = useState([]);
    const [show, setDisplay] = useState(false);
    const [result, setDisplayResult] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [keyWord, setKeyword] = useState('');
    const [newNotif, setNewNotif] = useState(false);
    const typingTimeout = useRef(null);
    const searchRef = useRef(null);


    const handleSearch = async (e) => {
        setKeyword(e.target.value);
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(() => {
            searchUsers(e.target.value, token, setSearchResults, setDisplayResult);
        }, 300);
    };

    const handleLogout = async (e) => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/logout`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
            });
            if (res.ok) {
                document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                if (connected && websocket) {
                    websocket.close()
                }
                
                router.push('/login');

            }
        } catch (err) {
            console.error("Error: ", err);
        }
    }

    const getNotifications = async () => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/notif`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        if (!loading) {
            getNotifications();
        }
        //here i made a change in dependency array
    }, [loading]);

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setDisplayResult(false);
        }
        setNewNotif(false);
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!websocket || !connected) return;

        const handleNewNotif = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'follow_request') {
                setNewNotif(true);
            }
        };

        websocket.addEventListener('message', handleNewNotif);
        return () => websocket.removeEventListener('message', handleNewNotif);
    }, [websocket, connected]);

    return (
        <nav className="main-nav">
            <div className="logo">SocialNet</div>
            <div className="nav-search" ref={searchRef}>
                <input type="text" value={keyWord} onChange={handleSearch} placeholder="Search..." onFocus={() => setDisplayResult(true)} />
                {result && (
                    <div className="search-dropdown">
                        {searchResults.length > 0 ? (
                            searchResults.map((user, index) => (
                                <ResultCard key={index} token={token} email={user.email} firstName={user.firstName} lastName={user.lastName} avatar={user.avatarUrl} 
                                />
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
                    {newNotif && <span className="notification-count"></span>}
                </div>
                {show && <Notif notifications={notifications} setNotifications={setNotifications} />}

                <Link href="/chat" className="nav-icon messages-icon">
                    <CommentIcon />
                </Link>

                <button className="nav-icon logout-btn" onClick={() => handleLogout()}>
                    <LogOutIcon />
                </button>
            </div>
        </nav>
    );
};

const ResultCard = ({ token, email, firstName, lastName, nickname, avatar }) => {
    const [image, setImage] = useState('/default_profile.jpg')

    useEffect(() => {
        const getImage = async () => {
            const newUrl = await getDownloadImage(avatar, token)
            setImage(newUrl)
        }
        getImage()
    }, [])
    console.log("this is the user that is being searched", email, firstName, lastName, nickname, avatar)
    return (
        <Link href={`/profile/${email}`} className="search-item">
            <img src={image} alt={firstName} className="search-avatar" />
            <div className="search-info">
                <span>{nickname}</span>
                <p>{firstName} {lastName}</p>
            </div>
        </Link>
    )
}

export default Navigation;