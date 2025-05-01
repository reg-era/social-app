'use client'

import { useState, useEffect } from "react";
import Link from "next/link.js";

import { LockIcon, GlobeIcon, CogIcon, UserPlusIcon, CheckIcon } from '@/utils/icons';
import PostCard from "./post.js";
import { useAuth } from "@/context/auth_context.js";
import { getDownloadImage } from "@/utils/helper.js";

export const ProfileHeader = ({ setActiveTab, userEmail }) => {
    const { token, loading } = useAuth();
    console.log("email", userEmail);

    const [isOwnProfile, setIsOwner] = useState(false)
    const [user, setUser] = useState({})
    const [error, setError] = useState(null);

    const getUserInfo = async () => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/user${(!isOwnProfile && userEmail) ? (`?target=${userEmail}`) : ''}`, {
                headers: {
                    'Authorization': token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                // console.log(data);

                data.avatarUrl = await getDownloadImage(data.avatarUrl, token)
                setUser(data)
            } else {
                setActiveTab('none')
                if (res.status === 404) {
                    setError(404)
                } else if (res.status === 401) {
                    setError(401)
                }
            }
        } catch (error) {
            console.error(error)
        }
    };

    useEffect(() => {
        if (typeof window !== undefined) {
            setIsOwner(window.location.pathname === '/profile');
        }
        console.log("test", userEmail, loading);

        !loading && getUserInfo();
    }, []);

    const [showPrivacySettings, setShowPrivacySettings] = useState(false);
    const togglePrivacy = async () => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/change-vis`, {
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
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/follow`, {
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

    if (user == {} || loading) {
        return (
            <div className="profile-header">
                <div className="profile-cover-photo"></div>
                <div className="profile-header-content">
                    <div className="profile-info">
                        <div className="profile-name-container"><h1>Loading</h1></div>
                    </div>
                </div>
            </div>
        )
    }

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
        return (
            <div className="private-profile-message">
                <LockIcon size="3x" />
                <h2>This Profile is Private</h2>
                <p>Follow this user to see their posts and other information.</p>
                <button
                    className={`follow-btn ${(user.isFollowing != 'unfollowed') ? 'following' : ''}`}
                    onClick={toggleFollow}
                >
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

    const [isOwnProfile, setIsOwner] = useState(false)
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    const getUserPosts = async () => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/user?target=post${(!isOwnProfile && userEmail) ? `&user=${userEmail}` : ''}`, {
                headers: {
                    'Authorization': token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            } else {
                switch (res.status) {
                    case 401: setError(401);
                    case 404: setError(404);
                }
            }
        } catch (error) {
            setError(500)
        }
    };

    // useEffect(() => {
    //     if (typeof window !== undefined) {
    //         setIsOwner(window.location.pathname === '/profile');
    //     }
    //     !loading && getUserPosts();
    // }, [userEmail, loading]);

    if (posts == [] || loading || error !== null) {
        return (
            <div className="profile-posts">
                <h1>loading</h1>
            </div>
        )
    }

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

    const [isOwnProfile, setIsOwner] = useState(false)
    const [users, setUsers] = useState([])
    const [error, setError] = useState(null);

    const getUserFollowers = async () => {
        try {
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/user?target=${activeTab === 'following' ? 'following' : 'follower'}${(!isOwnProfile && userEmail) ? `&user=${userEmail}` : ''}`, {
                headers: {
                    'Authorization': token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                data.forEach(async (user) => {
                    const downloaded = await getDownloadImage(user.avatarUrl, token)
                    user.avatarUrl = (downloaded === null) ? '/default_profile.jpg' : downloaded;
                });
                setUsers(data)
            } else {
                switch (res.status) {
                    case 401: setError(401);
                    case 404: setError(404);
                }
            }
        } catch (error) {
            setError(500)
        }
    };

    // useEffect(() => {
    //     if (typeof window !== undefined) {
    //         setIsOwner(window.location.pathname === '/profile');
    //     }
    //     !loading && getUserFollowers();
    // }, [userEmail, loading]);

    if (users == [] || loading || error !== null) {
        return (
            <div className="profile-people-list">
                <h1>loading</h1>
            </div>
        )
    }

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