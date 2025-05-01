'use client';

import '@/style/home.css';
import '@/style/groupname.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faLock, faGlobe, faUserPlus, faCog, faCalendarPlus, faMapMarkerAlt, faClock, faTimes, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

import Navigation from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import PostCard from '@/components/post';
import CreatePostCardGroup from '@/components/create_post_group';
import GroupInvitations from '@/components/group_invitations';
import CreateEventCard from '@/components/create_event';
import EventList from '@/components/event_list';
import MembersList from '@/components/MembersList';
import GroupChat from '@/components/group_chat';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { searchUsers } from '@/utils/api';

const GroupDetailPage = () => {
    const [activeTab, setActiveTab] = useState('discussion');
    const [groupData, setGroupData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [attendingStatus, setAttendingStatus] = useState({});
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [currentUserID, setCurrentUserID] = useState('');
    const [inviteSearchResults, setInviteSearchResults] = useState([]);
    const [showInviteSearchResults, setShowInviteSearchResults] = useState(false);
    const inviteSearchTimeout = useRef(null);
    const [error, setError] = useState(null);

    const params = useParams();
    const groupId = params.id;

    const [chatOpen, setChatOpen] = useState(false);
    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };

    const fetchGroupData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/info?group_id=${groupId}`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                method: "GET"
            });
            if (response.status === 400 || response.status === 403) {
                setError(response.status)
                throw new Error('Failed to fetch group data');
            }

            if (!response.ok) {
                throw new Error('Failed to fetch group data');
            }

            const data = await response.json();
            setGroupData(data);

            const postsResponse = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/post?group_id=${groupId}`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                method: "GET"
            });

            if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                setPosts(Array.isArray(postsData) ? postsData : []);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching group data:', error);
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/events?group_id=${groupId}`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
            });
            if (response.ok) {
                const eventsData = await response.json();
                setEvents(eventsData);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [groupId]);

    useEffect(() => {
        fetchEvents();
    }, [groupId]);

    useEffect(() => {
        const fetchCurrentID = async () => {
            try {
                const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/user`, {
                    headers: {
                        'Authorization': document.cookie.slice('auth_session='.length),
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUserID(userData.id);
                }
            } catch (error) {
                console.error('Error fetching current user id:', error);
            }
        };

        fetchCurrentID();
    }, []);

    const toggleAttending = (eventId) => {
        setAttendingStatus({
            ...attendingStatus,
            [eventId]: !attendingStatus[eventId]
        });
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('group_id', groupId);
            formData.append('action', 'invite');
            formData.append('user_id', inviteEmail);

            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/invitation`, {
                method: 'PUT',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            setShowInviteModal(false);
            setInviteEmail('');
        } catch (error) {
            alert(error)
            console.log('Error sending invite:', error);
        }
    };

    const isGroupCreator = groupData && groupData.creatorId === currentUserID;

    const handleCreateEvent = async () => {
        await fetchEvents();
    };

    const handleInviteSearch = async (e) => {
        const query = e.target.value;
        setInviteEmail(query);
        if (inviteSearchTimeout.current) {
            clearTimeout(inviteSearchTimeout.current);
        }
        inviteSearchTimeout.current = setTimeout(() => {
            searchUsers(query, document.cookie.slice('auth_session='.length), setInviteSearchResults, setShowInviteSearchResults);
        }, 300);
    };

    if (isLoading) {
        return <div className="loading">Loading group data...</div>;
    }
    if (error === 400 || error === 403) {
        return (
            <div>
                <Navigation />
                <div className="main-container">
                    <Sidebar />
                    <div className="content-area">
                        <div className="error-container">
                            <h2>Group Not Available</h2>
                            <p>
                                {error === 400
                                    ? "This group doesn't exist or has been removed."
                                    : "You don't have permission to view this group."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div>
            <Navigation />
            <div className="main-container">
                <Sidebar />

                <div className="content-area">{

                }
                    <div className="group-detail-container">
                        {/* Group Header */}
                        <div>
                            <div className="group-header-banner">
                                <div className="group-avatar">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                            </div>
                            <div className="group-info-section">
                                <h1 className="group-name">{groupData ? groupData.title : 'Group'}</h1>
                                <div className="group-meta">
                                    <div className="group-privacy">
                                        <FontAwesomeIcon icon={groupData && groupData.type === 'public' ? faGlobe : faLock} />
                                        <span>{groupData && groupData.type === 'public' ? 'Public Group' : 'Closed Group'}</span>
                                    </div>
                                    <div className="group-members-count">
                                        <FontAwesomeIcon icon={faUsers} />
                                        <span>
                                            {groupData && groupData.members
                                                ? `${groupData.members.filter(member => member.status === "accepted").length} members`
                                                : '0 members'}
                                        </span>
                                    </div>
                                </div>
                                <p className="group-description">{groupData ? groupData.description : ''}</p>
                                <div className="group-actions">
                                    <button className="action-btn" onClick={() => setShowInviteModal(true)}>
                                        <FontAwesomeIcon icon={faUserPlus} />
                                        <span>Invite</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="group-content-nav">
                            <button
                                className={`nav-tab ${activeTab === 'discussion' ? 'active' : ''}`}
                                onClick={() => setActiveTab('discussion')}
                            >
                                Posts
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'members' ? 'active' : ''}`}
                                onClick={() => setActiveTab('members')}
                            >
                                Members
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
                                onClick={() => setActiveTab('events')}
                            >
                                Events
                            </button>
                        </div>

                        {activeTab === 'discussion' && (
                            <div className="tab-content">
                                <div className="main-content">
                                    <CreatePostCardGroup
                                        onCreatePost={(data) => {
                                            setPosts([data, ...posts]);
                                        }}
                                        groupId={groupId}
                                    />
                                    {posts.length > 0 ? (
                                        posts.map((post, index) => (
                                            <div key={`${post.PostId}-${index}`}>
                                                <PostCard
                                                    key={post.PostId}
                                                    PostId={post.PostId}
                                                    authorName={`${post.user.firstName} ${post.user.lastName}`}
                                                    imageProfileUrl={post.user.avatarUrl}
                                                    imagePostUrl={post.imagePostUrl}
                                                    postText={post.postText}
                                                    postTime={post.postTime}
                                                    groupId={groupId}
                                                    isGroupPost={true}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-posts">
                                            <p>No posts in this group yet. Be the first to post!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <MembersList
                                groupId={groupId}
                                isGroupCreator={isGroupCreator}
                            />
                        )}

                        {activeTab === 'events' && (
                            <div className="events-header">
                                <h3>Upcoming Events</h3>
                                <CreateEventCard
                                    onCreateEvent={handleCreateEvent}
                                    groupId={groupId}
                                />
                                <EventList events={events} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Invite to Group</h2>
                            <button className="close-btn" onClick={() => setShowInviteModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={inviteEmail}
                                onChange={handleInviteSearch}
                                required
                            />
                            {showInviteSearchResults && (
                                <div className="invite-search-dropdown">
                                    {inviteSearchResults.length > 0 ? (
                                        inviteSearchResults.map((user, index) => (
                                            <div key={index} className="invite-search-item" onClick={() => setInviteEmail(user.email)}>
                                                <p>{user.email}</p>
                                                <span>{user.firstName} {user.lastName}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-results">No results found</p>
                                    )}
                                </div>
                            )}
                            <button type="submit" className="submit-btn">Send Invite</button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`group-chat-popup ${chatOpen ? 'open' : ''}`}>
                <div className="group-chat-header" onClick={toggleChat}>
                    <div className="group-chat-title">
                        <FontAwesomeIcon icon={faUsers} className="group-chat-icon" />
                        <span>Group Chat</span>
                        <span className="online-indicator">●</span>
                    </div>
                    <div className="group-chat-actions">
                        <button className="chat-action-btn"><FontAwesomeIcon icon={chatOpen ? faChevronDown : faChevronUp} /></button>
                    </div>
                </div>
                {chatOpen && <GroupChat groupId={groupId} userId={currentUserID} />}
            </div>
        </div>
    );
};

export default GroupDetailPage;