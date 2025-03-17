import '@/style/profile.css';
import { LockIcon, GlobeIcon, CogIcon, UserPlusIcon, CheckIcon } from '@/components/icons';

import { useState } from 'react';

import Navigation from '@/components/navbar';
import PostCard from '@/components/post';
import BackHome from '@/components/back_home';

const ProfilePage = () => {
    const [user, setUser] = useState({
        id: 1,
        username: 'chiwa7ed',
        fullName: 'Chiwa Ted',
        email: 'chiwa7ed@example.com',
        bio: 'Software developer | Photography enthusiast | Coffee lover',
        isPrivate: false,
        isOwnProfile: true,
        isFollowing: false,
        followers: 245,
        following: 173,
    });

    const posts = [
        {
            PostId: 1,
            authorName: 'profile',
            imagePostUrl: '/sdf/sdfsf',
            postText: 'tikchbila twiliwla',
            postTime: '2 hours ago',
            comments: 8,
        },
        {
            PostId: 2,
            authorName: 'profile',
            imagePostUrl: '',
            postText: 'Just finished working on a new project! #coding #webdev',
            postTime: '2 days ago',
            comments: 12,
        },
    ];

    const [activeTab, setActiveTab] = useState('posts');
    const [showPrivacySettings, setShowPrivacySettings] = useState(false);

    const togglePrivacy = () => {
        setUser({ ...user, isPrivate: !user.isPrivate });
        setShowPrivacySettings(false);
    };

    const toggleFollow = () => {
        setUser({ ...user, isFollowing: !user.isFollowing });
    };

    const people = [
        { id: 1, username: 'jane_smith', fullName: 'Jane Smith', isFollowing: true },
        { id: 2, username: 'john_doe', fullName: 'John Doe', isFollowing: false },
        { id: 3, username: 'alex_dev', fullName: 'Alex Johnson', isFollowing: true },
        { id: 4, username: 'sara_design', fullName: 'Sara Williams', isFollowing: false },
        { id: 5, username: 'mike_photo', fullName: 'Mike Peterson', isFollowing: true },
        { id: 6, username: 'emily_travel', fullName: 'Emily Davis', isFollowing: false },
    ];

    const isProfileVisible = user.isOwnProfile || !user.isPrivate || (user.isPrivate && user.isFollowing);

    return (
        <div>
            <Navigation />
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-cover-photo"></div>
                    <div className="profile-header-content">
                        <div className="profile-avatar"></div>
                        <div className="profile-info">
                            <div className="profile-name-container">
                                <h1>{user.fullName}</h1>
                                <span className="username">@{user.username}</span>
                                {user.isPrivate && (
                                    <span className="privacy-indicator">
                                        <LockIcon />
                                    </span>
                                )}
                            </div>
                            <p className="bio">{user.bio}</p>
                        </div>
                        <div className="profile-actions">
                            {user.isOwnProfile ? (
                                <>
                                    <button
                                        className="settings-btn"
                                        onClick={() => setShowPrivacySettings(!showPrivacySettings)}
                                    >
                                        <CogIcon />
                                    </button>
                                    {showPrivacySettings && (
                                        <div className="privacy-dropdown">
                                            <div className="privacy-option" onClick={togglePrivacy}>
                                                <span>{user.isPrivate ? <GlobeIcon /> : <LockIcon />}</span>
                                                <span>{user.isPrivate ? 'Make Profile Public' : 'Make Profile Private'}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
                                    onClick={toggleFollow}
                                >
                                    {user.isFollowing ? (
                                        <>
                                            <CheckIcon /> Following
                                        </>
                                    ) : (
                                        <>
                                            <UserPlusIcon /> Follow
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-item" onClick={() => setActiveTab('posts')}>
                        <span className="stat-count">{posts.length}</span>
                        <span className="stat-label">Posts</span>
                    </div>
                    <div className="stat-item" onClick={() => setActiveTab('followers')}>
                        <span className="stat-count">{user.followers}</span>
                        <span className="stat-label">Followers</span>
                    </div>
                    <div className="stat-item" onClick={() => setActiveTab('following')}>
                        <span className="stat-count">{user.following}</span>
                        <span className="stat-label">Following</span>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="profile-tabs">
                        <div
                            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            Posts
                        </div>
                        <div
                            className={`profile-tab ${activeTab === 'followers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('followers')}
                        >
                            Followers
                        </div>
                        <div
                            className={`profile-tab ${activeTab === 'following' ? 'active' : ''}`}
                            onClick={() => setActiveTab('following')}
                        >
                            Following
                        </div>
                    </div>

                    {isProfileVisible ? (
                        <div className="profile-tab-content">
                            {activeTab === 'posts' && (
                                <div className="profile-posts">
                                    {posts.map(post => (
                                        <PostCard
                                            key={post.PostId}
                                            PostId={post.PostId}
                                            authorName={post.authorName}
                                            imagePostUrl={post.imagePostUrl}
                                            postText={post.postText}
                                            postTime={post.postTime}
                                        />
                                    ))}
                                </div>
                            )}

                            {activeTab === 'followers' && (
                                <div className="profile-people-list">
                                    {people.map(person => (
                                        <div className="people-item" key={person.id}>
                                            <div className="people-avatar"></div>
                                            <div className="people-info">
                                                <div className="people-name">{person.fullName}</div>
                                                <div className="people-username">@{person.username}</div>
                                            </div>
                                            {user.isOwnProfile && (
                                                <button className={`follow-btn ${person.isFollowing ? 'following' : ''}`}>
                                                    {person.isFollowing ? (
                                                        <>
                                                            <CheckIcon /> Following
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlusIcon /> Follow
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'following' && (
                                <div className="profile-people-list">
                                    {people.map(person => (
                                        <div className="people-item" key={person.id}>
                                            <div className="people-avatar"></div>
                                            <div className="people-info">
                                                <div className="people-name">{person.fullName}</div>
                                                <div className="people-username">@{person.username}</div>
                                            </div>
                                            <button className={`follow-btn ${true ? 'following' : ''}`}>
                                                <CheckIcon /> Following
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="private-profile-message">
                            <LockIcon size="3x" />
                            <h2>This Profile is Private</h2>
                            <p>Follow this user to see their posts and other information.</p>
                            <button className="follow-btn" onClick={toggleFollow}>
                                <UserPlusIcon /> Follow
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <BackHome />
        </div>
    );
};

export default ProfilePage;

