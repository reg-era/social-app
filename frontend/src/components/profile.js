'use client'

import { useState, useEffect } from "react";
import Link from "next/link.js";

import { LockIcon, GlobeIcon, CogIcon, UserPlusIcon, CheckIcon } from '@/utils/icons';
import PostCard from "./post.js";
import { useAuth } from "@/context/auth_context.js";

export const ProfileHeader = ({ setActiveTab, userEmail }) => {
    const { token, loading } = useAuth();

    let isOwnProfile = false;
    isOwnProfile = window?.location.pathname === '/profile';

    const [error, setError] = useState(null);
    const getUserInfo = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/user${(!isOwnProfile && userEmail) ? (`?target=${userEmail}`) : ''}`, {
                headers: {
                    'Authorization': token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data)
            }
        } catch (error) {
            console.error(error)
        }
    };

    const [profileImage, setProfileImage] = useState('/default_profile.jpg');

    const getDownloadImage = async (link, isPost) => {
        try {
            if (link !== '') {
                const res = await fetch(link, {
                    headers: {
                        'Authorization': token,
                    },
                });
                const image = await res.blob();
                const newUrl = URL.createObjectURL(image);
                isPost ? setImageURL(newUrl) : setProfileImage(newUrl)
            }
        } catch (err) {
            console.error("fetching image: ", err);
        }
    };

    useEffect(() => {
        !loading && getUserInfo();
    }, [userEmail, loading]);

    const [showPrivacySettings, setShowPrivacySettings] = useState(false);
    const togglePrivacy = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/change-vis`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setUser({ ...user, isPublic: data.isPublic });
                setShowPrivacySettings(false);
            } else {
                console.error('Failed to fetch userinfos');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFollow = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/follow`, {
                method: 'POST',
                body: JSON.stringify({
                    email: userEmail,
                }),
                headers: {
                    'Authorization': token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setUser({ ...user, isFollowing: data.state });
                setShowPrivacySettings(false);
            } else {
                console.error('Failed to fetch userinfos');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [user, setUser] = useState({})

    useEffect(() => {
        getUserInfo();
    }, [userEmail]);


    if (error === 404) {
        return (
            <div className="profile-header">
                <div className="profile-cover-photo"></div>
                <div className="profile-header-content">
                    <div className="profile-info">
                        <div className="profile-name-container"><h1>Account not found</h1></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error === 401) {
        setActiveTab('none');
        return (
            <div className="private-profile-message">
                <LockIcon size="3x" />
                <h2>This Profile is Private</h2>
                <p>Follow this user to see their posts and other information.</p>
                <button className="follow-btn" onClick={toggleFollow}>
                    <UserPlusIcon /> Follow
                </button>
            </div>
        )
    }

    return (
        <>
            <div className="profile-header">
                <div className="profile-cover-photo"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar" style={{
                        backgroundImage: `url(${user.avatarUrl})`,
                        backgroundSize: 'cover'
                    }}></div>
                    <div className="profile-info">
                        <div className="profile-name-container">
                            <h1>{`${user.firstName} ${user.lastName}`}</h1>
                            <span className="username">@{user.nickname}</span>
                            {!user.isPublic && (
                                <span className="privacy-indicator">
                                    <LockIcon />
                                </span>
                            )}
                        </div>
                        <p className="bio">{user.aboutMe}</p>
                    </div>
                    <div className="profile-actions">
                        {isOwnProfile ? (
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
                                            <span>{!user.isPublic ? <GlobeIcon /> : <LockIcon />}</span>
                                            <span>{!user.isPublic ? 'Make Profile Public' : 'Make Profile Private'}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                className={`follow-btn ${(user.isFollowing != 'unfollowed') ? 'following' : ''}`}
                                onClick={toggleFollow}
                            >
                                {(user.isFollowing === 'followed') && <><CheckIcon /> Following </>}
                                {(user.isFollowing === 'pending') && <><CheckIcon /> Request sent </>}
                                {(user.isFollowing === 'unfollowed') && <><UserPlusIcon /> Follow </>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-item" onClick={() => setActiveTab('followers')}>
                    <span className="stat-count">{user.followers}</span>
                    <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item" onClick={() => setActiveTab('following')}>
                    <span className="stat-count">{user.followings}</span>
                    <span className="stat-label">Following</span>
                </div>
            </div>
        </>
    )
}

export const ProfilePost = ({ userEmail }) => {
    const { token, loading } = useAuth();

    let isOwnProfile = false;
    isOwnProfile = window?.location.pathname === '/profile';

    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    const getUserPosts = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/user?target=post${(!isOwnProfile && userEmail) ? `&user=${userEmail}` : ''}`, {
                headers: {
                    'Authorization': token,
                },
            });

            if (!res.ok) {
                setError(500)
                return
            }
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            setError(500)
        }
    };

    useEffect(() => {
        !loading && getUserPosts();
    }, [userEmail, loading]);

    return (
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
    )
}

export const ProfileFollower = ({ activeTab, userEmail }) => {
    const { token, loading } = useAuth();

    let isOwnProfile = false;
    isOwnProfile = window?.location.pathname === '/profile';

    const [users, setUsers] = useState([])
    const [error, setError] = useState(null);

    const getUserFollowers = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/user?target=${activeTab === 'following' ? 'following' : 'follower'}${(!isOwnProfile && userEmail) ? `&user=${userEmail}` : ''}`, {
                headers: {
                    'Authorization': token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                data.forEach(async (user) => {
                    const downloaded = await getDownloadImage(user.avatarUrl)
                    user.avatarUrl = (downloaded === null) ? '/default_profile.jpg' : downloaded;
                });
                setUsers(data)
            } else {
                setError(500)
            }
        } catch (error) {
            setError(500)
        }
    };

    useEffect(() => {
        !loading && getUserFollowers();
    }, [userEmail, loading]);

    return (
        <div className="profile-people-list">
            {users.map((user, index) => (
                <Link className="people-item" key={index} href={`/profile/${user.email}`} >
                    <div className="people-avatar" style={{
                        backgroundImage: `url(${user.avatarUrl})`,
                        backgroundSize: 'cover'
                    }}></div>
                    <div className="people-info">
                        <div className="people-name">{`${user.firstName} ${user.lastName}`}</div>
                        <div className="people-username">@{user.nickname}</div>
                    </div>
                </Link>
            ))}
        </div>
    )
} 