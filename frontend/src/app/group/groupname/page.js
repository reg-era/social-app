'use client';
import './home.css';
import './grouppage.css';
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell, faComment, faUser, faHome, faUsers, faEllipsisH, 
    faSignOut, faLock, faGlobe, faUserPlus, faBell as faNotification,
    faCalendarAlt, faClock, faMapMarkerAlt, faCamera, faHeart,
    faShare, faCalendarPlus, faCog, faBookmark, faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const GroupDetailPage = () => {
    const [activeTab, setActiveTab] = useState('discussion');

    // Sample data for posts
    const posts = [
        {
            id: 1,
            user: {
                name: 'Alex Johnson',
                avatar: '/avatar1.jpg'
            },
            content: 'Just finished my first React project! The component lifecycle was tricky at first, but I finally got the hang of it. Has anyone else struggled with useEffect dependencies?',
            image: '/project-image.jpg',
            time: '2 hours ago',
            comments: 8,
        },
        {
            id: 2,
            user: {
                name: 'Maya Williams',
                avatar: '/avatar2.jpg'
            },
            content: 'Looking for recommendations on the best CSS framework for a new e-commerce project. Currently considering Tailwind, Bootstrap, and Bulma. Any thoughts or experiences to share?',
            time: '5 hours ago',

            comments: 22,

        },
        {
            id: 3,
            user: {
                name: 'Theo Rodriguez',
                avatar: '/avatar3.jpg'
            },
            content: 'Excited to share that our team just open-sourced our accessibility component library! Built with TypeScript and React, it includes fully accessible dropdowns, modals, and form elements.',
            image: '/library-preview.jpg',
            time: 'Yesterday',
            comments: 12,

        }
    ];

    // Sample members data
    const members = [
        { id: 1, name: 'Sarah Chen', role: 'Admin', avatar: '/member1.jpg' },
        { id: 2, name: 'David Kim', role: 'Moderator', avatar: '/member2.jpg' },
        { id: 3, name: 'Priya Sharma', role: 'Member', avatar: '/member3.jpg' },
        { id: 4, name: 'James Wilson', role: 'Member', avatar: '/member4.jpg' },
        { id: 5, name: 'Maria Garcia', role: 'Member', avatar: '/member5.jpg' },
        { id: 6, name: 'Jamal Adams', role: 'Member', avatar: '/member6.jpg' },
        { id: 7, name: 'Emma Thompson', role: 'Member', avatar: '/member7.jpg' },
        { id: 8, name: 'Li Wei', role: 'Member', avatar: '/member8.jpg' }
    ];

    // Sample events data
    const events = [
        {
            id: 1,
            title: 'Web Development Workshop',
            date: { day: '15', month: 'MAR' },
            time: '6:00 PM',
            location: 'Tech Hub Downtown',
            attending: true
        },
        {
            id: 2,
            title: 'React Native Hackathon',
            date: { day: '22', month: 'MAR' },
            time: '9:00 AM',
            location: 'Innovation Center',
            attending: false
        },
        {
            id: 3,
            title: 'API Integration Masterclass',
            date: { day: '29', month: 'MAR' },
            time: '2:00 PM',
            location: 'Virtual Event',
            attending: false
        }
    ];



    const [attendingStatus, setAttendingStatus] = useState(
        events.reduce((acc, event) => ({ ...acc, [event.id]: event.attending }), {})
    );

    const toggleAttending = (eventId) => {
        setAttendingStatus({
            ...attendingStatus,
            [eventId]: !attendingStatus[eventId]
        });
    };

    return (
        <div>
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
                    <button className="nav-icon logout-btn">
                        <FontAwesomeIcon icon={faSignOut} />
                    </button>
                </div>
            </nav>

            <div className="main-container">
                {/* Left Sidebar */}
                <div className="sidebar left-sidebar">
                    <div className="sidebar-menu">
                        <div className="menu-item">
                            <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FontAwesomeIcon icon={faHome} />
                                <span>Home</span>
                            </Link>
                        </div>
                        <div className="menu-item">
                            <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FontAwesomeIcon icon={faUser} />
                                <span>Profile</span>
                            </Link>
                        </div>
                        <div className="menu-item active">
                            <Link href="/groups" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FontAwesomeIcon icon={faUsers} />
                                <span>Groups</span>
                            </Link>
                        </div>
                    </div>
                    <div className="sidebar-section">
                        <h3>Your Groups</h3>
                        <div className="sidebar-item">
                            <div className="sidebar-icon group-icon"></div>
                            <span>Web Development</span>
                        </div>
                        <div className="sidebar-item">
                            <div className="sidebar-icon group-icon"></div>
                            <span>UI/UX Design</span>
                        </div>
                        <div className="sidebar-item">
                            <div className="sidebar-icon group-icon"></div>
                            <span>Photography Club</span>
                        </div>
                        <div className="sidebar-item view-more">
                            <span>See All Groups</span>
                        </div>
                    </div>
                </div>

                {/* Group Detail Content */}
                <div className="content-area">
                    <div className="group-detail-container">
                        {/* Group Header */}
                        <div>
                            <div className="group-header-banner">
                                <div className="group-avatar">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                            </div>
                            <div className="group-info-section">
                                <h1 className="group-name">Web Development</h1>
                                <div className="group-meta">
                                    <div className="group-privacy">
                                        <FontAwesomeIcon icon={faGlobe} />
                                        <span>Public Group</span>
                                    </div>
                                    <div className="group-members-count">
                                        <FontAwesomeIcon icon={faUsers} />
                                        <span>24.5K members</span>
                                    </div>
                                </div>
                                <p className="group-description">
                                    A community for web developers to share knowledge, ask questions, and collaborate on projects. 
                                    We discuss frontend frameworks, backend technologies, UI/UX design, and more.
                                </p>
                                <div className="group-actions">
                                    <button className="action-btn">
                                        <FontAwesomeIcon icon={faUserPlus} />
                                        <span>Invite</span>
                                    </button>
                                    <button className="action-btn secondary-btn">
                                        <FontAwesomeIcon icon={faCog} />
                                        <span>Settings</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="group-content-nav">
                            <div 
                                className={`nav-tab ${activeTab === 'discussion' ? 'active' : ''}`}
                                onClick={() => setActiveTab('discussion')}
                            >
                                Discussion
                            </div>
                            <div 
                                className={`nav-tab ${activeTab === 'members' ? 'active' : ''}`}
                                onClick={() => setActiveTab('members')}
                            >
                                Members
                            </div>
                            <div 
                                className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
                                onClick={() => setActiveTab('events')}
                            >
                                Events
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'discussion' && (
                            <div className="tab-content">
                                <div className="main-content">
                                    {/* Create Post */}
                                    <div className="create-post-card">
                                        <div className="create-post-header">
                                            <div className="user-avatar"></div>
                                            <div className="input-actions-container">
                                                <div className="input-with-photo">
                                                    <div className="post-input">
                                                        <input type="text" placeholder="Write something to the group..." />
                                                    </div>
                                                    <button className="photo-action">
                                                        <FontAwesomeIcon icon={faCamera} />
                                                        <span>Photo</span>
                                                    </button>
                                                </div>
                                                <button className="submit-button">
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Posts */}
                                    {posts.map(post => (
                                        <div className="post-card" key={post.id}>
                                            <div className="post-header">
                                                <div className="post-user">
                                                    <div className="user-avatar"></div>
                                                    <div className="post-user-info">
                                                        <div className="post-username">{post.user.name}</div>
                                                        <div className="post-time">{post.time}</div>
                                                    </div>
                                                </div>
                                                <div className="post-options">
                                                    <FontAwesomeIcon icon={faEllipsisH} />
                                                </div>
                                            </div>
                                            <div className="post-content">
                                                <p>{post.content}</p>
                                                {post.image && (
                                                    <div className="post-image">
                                                        <img src={post.image} alt="Post content" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="post-stats">
                                                <div className="stat-group">
                                                    <span>{post.comments} comments</span>
                                                </div>
                                            </div>
                                            <div className="post-actions">
                                              
                                                <button className="post-action-btn">
                                                    <FontAwesomeIcon icon={faComment} />
                                                    <span>Comment</span>
                                                </button>
                                                <button className="post-action-btn">
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="members-list">
                                <div className="members-header">
                                    <h3>Group Members ({members.length})</h3>
                                    <input type="text" placeholder="Search members..." className="search-members" />
                                </div>
                                <div className="members-grid">
                                    {members.map(member => (
                                        <div className="member-card" key={member.id}>
                                            <div className="member-card-avatar"></div>
                                            <div className="member-card-name">{member.name}</div>
                                            <div className="member-card-role">{member.role}</div>
                                            <button className="member-card-action">
                                                <FontAwesomeIcon icon={faUserPlus} />
                                                <span>Connect</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div className="events-list">
                                <div className="events-header">
                                    <h3>Upcoming Events</h3>
                                    <button className="create-event-btn">
                                        <FontAwesomeIcon icon={faCalendarPlus} />
                                        <span>Create Event</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;