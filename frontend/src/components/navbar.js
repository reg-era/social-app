import Link from 'next/link';
import { BellIcon, CommentIcon, UserIcon } from '@/components/icons';
import { useState, useRef } from 'react';
import Notif from './notification';

const Navigation = () => {
    const [show, setDisplay] = useState(false);
    const notifications = [
        "You have a new follower",
        "Your post got a like",
        "Someone commented on your post",
    ];

    const [result, setDisplayResult] = useState(false)
    const SearchResult = [
        { firstName: "user1", lastName: "smo3lih", avatarUrl: "", email: "dfsdfsd@gmail.com" },
        { firstName: "user2", lastName: "smo3lih", avatarUrl: "/api/pjoto", email: "dfsdfsd@gmail.com" },
        { firstName: "user3", lastName: "smo3lih", avatarUrl: "", email: "dfsdfsd@gmail.com" }
    ]

    const [keyWord, setKeyword] = useState('');
    const typingTimeout = useRef(null);

    const handleSearch = (e) => {
        setKeyword(e.target.value)

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(async () => {
            setKeyword(e.target.value);
            if (e.target.value == "") return
            try {
                const res = await fetch(`http://127.0.0.1:8080/api/search?target=${e.target.value}`, {
                    headers: {
                        'Authorization': document.cookie.slice('auth_session='.length),
                    },
                })
                if (res.ok) {
                    const data = await res?.json()
                    console.log(data);
                }
            } catch (err) {
                console.error("error: ", err)
            }
        }, 300);
    };

    return (
        <nav className="main-nav">
            <div className="logo">SocialNet</div>
            <div className="nav-search">
                <input type="text" value={keyWord} onChange={handleSearch} placeholder="Search..." />
                {/* {add the pop down to display the search result like msj sidbar feel free} */}
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
