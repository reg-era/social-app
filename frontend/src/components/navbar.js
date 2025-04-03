import Link from 'next/link';
import { BellIcon, CommentIcon, UserIcon, LogOutIcon } from '@/utils/icons';
import { faImage, faGlobe, faLock, faUserTag, faTimes, faSmile, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect,  } from 'react';
import Notif from './notification';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/context/ws_context';

const Navigation = () => {
    const router = useRouter();
    
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
                const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/search?target=${e.target.value}`, {
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
    
    const { websocket, connected } = useWebSocket();
    const handleLogout = async (e) => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/logout`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
            });
            if (res.ok) {
                document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                connected && websocket.close()
                router.push('/login')
            }
        } catch (err) {
            console.error("Error: ", err);
        }
    }

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
                <input type="text" value={keyWord} onChange={handleSearch} placeholder="Search..." onFocus={() => setDisplayResult(true)} />
                {result && (
                    <div className="search-dropdown">
                        {searchResults.length > 0 ? (
                            searchResults.map((user, index) => (
                                <ResultCard key={index} email={user.email} firstName={user.firstName} lastName={user.lastName} avatar={user.avatarUrl} />
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
                {show && <Notif />}

                <Link href="/chat" className="nav-icon messages-icon">
                    <CommentIcon />
                    <span className="messages-count">5</span>
                </Link>

                <button className="nav-icon logout-btn" onClick={() => handleLogout()}>
                    <LogOutIcon />
                </button>
            </div>
        </nav>
    );
};

const ResultCard = ({ email, firstName, lastName, nickname, avatar }) => {
    const [image, setImage] = useState('/default_profile.jpg')

    const getImage = async () => {
        if (avatar === '') return
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/${avatar}`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
            })
            if (res.ok) {
                const image = await res.blob();
                const newUrl = URL.createObjectURL(image);
                setImage(newUrl)
            }
        } catch (err) {
            console.error("geting img: ", err);
        }
    }

    useEffect(() => {
        getImage()
    }, [])

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