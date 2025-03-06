'use client';
import './home.css';
import './profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, faComment, faUser, faHome, faUsers, faEllipsisH, 
  faHeart, faImage, faLock, faGlobe, faCog, faUserPlus, faCheck,faSignOut
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Link from 'next/link';

const ProfilePage = () => {
  // Sample user data - in a real app, this would come from your backend
  const [user, setUser] = useState({
    id: 1,
    username: 'chiwa7ed',
    fullName: 'Chiwa Ted',
    email: 'chiwa7ed@example.com',
    bio: 'Software developer | Photography enthusiast | Coffee lover',
    isPrivate: false,
    isOwnProfile: true, // Set to true if viewing own profile, false if viewing someone else's
    isFollowing: false, // Only relevant if viewing someone else's profile
    followers: 245,
    following: 173,
  });

  // Sample posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      content: 'tikchbila twiliwla',
      image: true,
      likes: 32,
      comments: 8,
      time: '2 hours ago'
    },
    {
      id: 2,
      content: 'Just finished working on a new project! #coding #webdev',
      image: false,
      likes: 47,
      comments: 12,
      time: '2 days ago'
    },
  ]);

  // Sample followers/following
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'followers', 'following'
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  // Toggle profile privacy
  const togglePrivacy = () => {
    setUser({...user, isPrivate: !user.isPrivate});
    setShowPrivacySettings(false);
  };

  // Follow/unfollow user
  const toggleFollow = () => {
    setUser({...user, isFollowing: !user.isFollowing});
  };

  // Sample people lists for followers/following tabs
  const people = [
    { id: 1, username: 'jane_smith', fullName: 'Jane Smith', isFollowing: true },
    { id: 2, username: 'john_doe', fullName: 'John Doe', isFollowing: false },
    { id: 3, username: 'alex_dev', fullName: 'Alex Johnson', isFollowing: true },
    { id: 4, username: 'sara_design', fullName: 'Sara Williams', isFollowing: false },
    { id: 5, username: 'mike_photo', fullName: 'Mike Peterson', isFollowing: true },
    { id: 6, username: 'emily_travel', fullName: 'Emily Davis', isFollowing: false },
  ];

  // Check if profile should be visible (own profile or public or following a private profile)
  const isProfileVisible = user.isOwnProfile || !user.isPrivate || (user.isPrivate && user.isFollowing);

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
          <Link href="/chat" className="nav-icon messages-icon">
            <FontAwesomeIcon icon={faComment} />
            <span className="messages-count">5</span>
          </Link>
            <button className="nav-icon logout-btn">
                <FontAwesomeIcon icon={faSignOut} />
            </button>
        </div>
      </nav>

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
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                )}
              </div>
              <p className="bio">{user.bio}</p>
              <div className="profile-details">
                <span className="detail-item">
                </span>
              </div>
            </div>
            <div className="profile-actions">
              {user.isOwnProfile ? (
                <>
                  <button 
                    className="settings-btn"
                    onClick={() => setShowPrivacySettings(!showPrivacySettings)}
                  >
                    <FontAwesomeIcon icon={faCog} />
                  </button>
                  {showPrivacySettings && (
                    <div className="privacy-dropdown">
                      <div className="privacy-option" onClick={togglePrivacy}>
                        <FontAwesomeIcon icon={user.isPrivate ? faGlobe : faLock} />
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
                      <FontAwesomeIcon icon={faCheck} /> Following
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserPlus} /> Follow
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
                    <div className="post-card" key={post.id}>
                      <div className="post-header">
                        <div className="post-author-avatar"></div>
                        <div className="post-info">
                          <div className="post-author-name">{user.fullName}</div>
                          <div className="post-time">{post.time}</div>
                        </div>
                      </div>
                      <div className="post-content">
                        <p className="post-text">{post.content}</p>
                        {post.image && <div className="post-image"></div>}
                      </div>
                      <div className="post-stats">
                        <div className="likes">{post.likes} likes</div>
                        <div className="comments">{post.comments} comments</div>
                      </div>
                      <div className="post-actions">
                        <button className="like-button">
                          <FontAwesomeIcon icon={faHeart} />
                          <span>Like</span>
                        </button>
                        <button className="comment-button">
                          <FontAwesomeIcon icon={faComment} />
                          <span>Comment</span>
                        </button>
                      </div>
                    </div>
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
                              <FontAwesomeIcon icon={faCheck} /> Following
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faUserPlus} /> Follow
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
                        <FontAwesomeIcon icon={faCheck} /> Following
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="private-profile-message">
              <FontAwesomeIcon icon={faLock} size="3x" />
              <h2>This Profile is Private</h2>
              <p>Follow this user to see their posts and other information.</p>
              <button className="follow-btn" onClick={toggleFollow}>
                <FontAwesomeIcon icon={faUserPlus} /> Follow
              </button>
            </div>
          )}
        </div>
      </div>

      <Link href="/" className="back-to-home">
        <FontAwesomeIcon icon={faHome} />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};

export default ProfilePage;