
'use client';
import './home.css';
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell, faComment, faUser, faHome, faUsers, faEllipsisH, faHeart, faImage
} from '@fortawesome/free-solid-svg-icons';

const SocialNetPage = () => {
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
                    <div className="nav-icon profile-thumbnail">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                </div>
            </nav>

            <div className="main-container">
                {/* Left Sidebar */}
                <div className="sidebar left-sidebar">
                    <div className="sidebar-menu">
                        <div className="menu-item active">
                            <FontAwesomeIcon icon={faHome} />
                            <span>Home</span>
                        </div>
                        <div className="menu-item">
                            <FontAwesomeIcon icon={faUser} />
                            <span>Profile</span>
                        </div>
                        <div className="menu-item">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>Groups</span>
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

                {/* Content Area */}
                <div className="create-post-card">
                    <div className="create-post-header">
                        <div className="user-avatar"></div>
                        <div className="input-actions-container">
                            <div className="input-with-photo">
                                <div className="post-input">
                                    <input type="text" placeholder="What's on your mind?" />
                                </div>
                                <button className="photo-action">
                                    <FontAwesomeIcon icon={faImage} />
                                    <span>Photo</span>
                                </button>
                            </div>
                            <button className="submit-button">
                                Post
                            </button>
                        </div>
                    </div>

                    <div className="post-card">
                        <div className="post-header">
                            <div className="post-author-avatar"></div>
                            <div className="post-info">
                                <div className="post-author-name">chiwa7ed</div>
                                <div className="post-time">2 hours ago</div>
                            </div>
                            <div className="post-options">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </div>
                        </div>
                        <div className="post-content">
                            <p className="post-text">tikchbila twiliwla</p>
                            <div className="post-image"></div>
                        </div>
                        <div className="post-stats">
                            <div className="comments">36 comments</div>
                        </div>
                        <div className="post-actions">
                            <button className="comment-button">
                                <FontAwesomeIcon icon={faComment} />
                                <span>Comment</span>
                            </button>
                        </div>
                        <div className="post-comments">
                            <div className="comment-item">
                                <div className="comment-avatar"></div>
                                <div className="comment-content">
                                    <div className="comment-author">Jane Smith</div>
                                    <div className="comment-text">This looks amazing! Great job!</div>
                                    <div className="comment-actions">
                                        <span className="comment-reply">Reply</span>
                                        <span className="comment-time">15 min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="add-comment">
                                <div className="comment-avatar"></div>
                                <input type="text" placeholder="Write a comment..." />
                            </div>
                        </div>
                    </div>

                    <div className="post-card">
                        <div className="post-header">
                            <div className="post-author-avatar"></div>
                            <div className="post-info">
                                <div className="post-author-name">Web Development Group</div>
                                <div className="post-time">5 hours ago</div>
                            </div>
                            <div className="post-options">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </div>
                        </div>
                        <div className="post-content">
                            <p className="post-text">Our next meetup will be on Friday at 7 PM. We'll be discussing the latest frontend frameworks!</p>
                        </div>
                        <div className="post-stats">
                            <div className="comments">12 comments</div>
                        </div>
                        <div className="post-actions">
                            <button className="comment-button">
                                <FontAwesomeIcon icon={faComment} />
                                <span>Comment</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialNetPage;