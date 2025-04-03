'use client';

import '@/style/home.css';
import '@/style/groupname.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faLock, faGlobe, faUserPlus, faCog, faCalendarPlus, faMapMarkerAlt, faClock, faTimes } from '@fortawesome/free-solid-svg-icons';

import Navigation from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import PostCard from '@/components/post';
import CreatePostCardGroup from '@/components/create_post_group';
import GroupInvitations from '@/components/group_invitations';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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

    const params = useParams();
    const groupId = params.id;


    const fetchGroupData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/info?group_id=${groupId}`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch group data');
            }

            const data = await response.json();
            console.log("these are the group members", data.members)
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

    const fetchPendingInvitations = async () => {
        try {
            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/invitations`, {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                method: "GET"
            });

            if (response.ok) {
                const data = await response.json();
                setPendingInvitations(data);
            }
        } catch (error) {
            console.error('Error fetching invitations:', error);
        }
    };

    useEffect(() => {
        fetchGroupData();
        fetchPendingInvitations();
    }, [groupId]);

    const toggleAttending = (eventId) => {
        setAttendingStatus({
            ...attendingStatus,
            [eventId]: !attendingStatus[eventId]
        });
    };

    // const handleFollowRequest = async (userEmail) => {
    //     try {
    //         const response = await fetch('http://127.0.0.1:8080/api/follow', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': document.cookie.slice('auth_session='.length),
    //             },
    //             body: JSON.stringify({
    //                 email: userEmail
    //             })
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to send follow request');
    //         }

    //         alert('Follow request sent!');
    //     } catch (error) {
    //         console.error('Error sending follow request:', error);
    //         alert('Failed to send follow request');
    //     }
    // };

    const handleInvite = async (e) => {
        e.preventDefault();
        console.log("handle invite  ")
        try {
            const formData = new FormData();
            formData.append('group_id', groupId);
            formData.append('action', 'invite');
            formData.append('user_id', inviteEmail);

            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group`, {
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



    if (isLoading) {
        return <div className="loading">Loading group data...</div>;
    }

    return (
        <div>
            <Navigation />
            <div className="main-container">
                <Sidebar />

                <div className="content-area">
                    <GroupInvitations />

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
                                        <span>{groupData && groupData.members ? `${groupData.members.length} members` : '0 members'}</span>
                                    </div>
                                </div>
                                <p className="group-description">{groupData ? groupData.description : ''}</p>
                                <div className="group-actions">
                                    <button className="action-btn" onClick={() => setShowInviteModal(true)}>
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
                            <div className="members-list">
                                <div className="members-header">
                                    <h3>Group Members ({groupData?.Members?.length || 0})</h3>
                                    <input type="text" placeholder="Search members..." className="search-members" />
                                </div>
                                <div className="members-grid">
                                    {groupData?.members?.length > 0 ? (
                                        groupData.members.map(member => (
                                            <div className="member-card" key={member.userId}>
                                                <div className="member-card-avatar"></div>
                                                <div className="member-card-name">{member.userName}</div>
                                                <div className="member-card-role">{member.status}</div>
                                                <button
                                                    className="member-card-action"
                                                    onClick={() => handleFollowRequest(member.email)}
                                                >
                                                    <FontAwesomeIcon icon={faUserPlus} />
                                                    <span>Connect</span>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-members">
                                            <p>No members in this group yet.</p>
                                        </div>
                                    )}
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
                                <div className="events-container">
                                    {events.map(event => (
                                        <div className="event-card" key={event.id}>
                                            <div className="event-date">
                                                <div className="event-month">{event.date.month}</div>
                                                <div className="event-day">{event.date.day}</div>
                                            </div>
                                            <div className="event-details">
                                                <div className="event-title">{event.title}</div>
                                                <div className="event-meta">
                                                    <div className="event-time">
                                                        <FontAwesomeIcon icon={faClock} />
                                                        <span>{event.time}</span>
                                                    </div>
                                                    <div className="event-location">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                        <span>{event.location}</span>
                                                    </div>
                                                </div>
                                                <button className={`event-attend-btn ${attendingStatus[event.id] ? 'attending' : ''}`}
                                                    onClick={() => toggleAttending(event.id)}
                                                >
                                                    {attendingStatus[event.id] ? 'Attending' : 'Attend'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="submit-btn">Send Invite</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetailPage;