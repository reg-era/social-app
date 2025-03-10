'use client';
import './home.css';
import './group.css';
import Link from 'next/link';
import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell, faComment, faUser, faHome, faUsers, faSignOut, faPlus, faTimes
} from '@fortawesome/free-solid-svg-icons';

const GroupsPage = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [newGroupType, setNewGroupType] = useState('public');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteList, setInviteList] = useState([]);
    
    const handleCreateGroup = (e) => {
        e.preventDefault();
        // Here you would implement the API call to create the group
        // For now, we'll just close the modal
        setShowCreateModal(false);
        
        // Reset form fields
        setNewGroupTitle('');
        setNewGroupDescription('');
        setNewGroupType('public');
        setInviteList([]);
    };
    
    const addInvite = (e) => {
        e.preventDefault();
        if (inviteEmail && !inviteList.includes(inviteEmail)) {
            setInviteList([...inviteList, inviteEmail]);
            setInviteEmail('');
        }
    };
    
    const removeInvite = (email) => {
        setInviteList(inviteList.filter(item => item !== email));
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

                {/* Groups Content */}
                <div className="content-area">
                    <div className="groups-header">
                        <div className="header-title">
                            <div className="groups-icon">
                                <FontAwesomeIcon icon={faUsers} />
                            </div>
                            <h2>Groups</h2>
                        </div>
                        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                            CREATE GROUP
                        </button>
                    </div>

                    <div className="groups-grid">
                        {/* Group Card 1 */}
                        <div className="group-card">
                            <div className="group-card-content">
                                <div className="group-header">
                                    <div className="group-type public-group">
                                        Public group
                                    </div>
                                </div>
                                <h3 className="group-title">I am Programmer; I have no life.</h3>
                                <p className="group-description">
                                    A community for programmers to share jokes, memes, and stories about coding life.
                                </p>
                                <div className="group-footer">
                                    <button className="open-btn">
                                        open
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Group Card 2 */}
                        <div className="group-card">
                            <div className="group-card-content">
                                <div className="group-header">
                                    <div className="group-type public-group">
                                        Public group
                                    </div>
                                </div>
                                <h3 className="group-title">WordPress Developer & Web Designer</h3>
                                <p className="group-description">
                                    Rules for WordPress Developer & Web Designer Group: Everything about WordPress & Web
                                </p>
                                <div className="group-footer">
                                    <button className="open-btn">
                                        OPEN
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Group Card 3 */}
                        <div className="group-card">
                            <div className="group-card-content">
                                <div className="group-header">
                                    <div className="group-type closed-group">
                                        Closed group
                                    </div>
                                </div>
                                <h3 className="group-title">Web Design and Development</h3>
                                <p className="group-description">
                                    Those who are interested in their projects designing and development like Website, Games and Mobile
                                </p>
                                <div className="group-footer">
                                    <button className="open-btn">
                                        OPEN
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Group Card 4 */}
                        <div className="group-card">
                            <div className="group-card-content">
                                <div className="group-header">
                                    <div className="group-type public-group">
                                        Public group
                                    </div>
                                </div>
                                <h3 className="group-title">Graphic Design</h3>
                                <p className="group-description">
                                    This group is for pure job posts for Graphic design background like Logo, Business Card, Book Covers.
                                </p>
                                <div className="group-footer">
                                    <button className="open-btn">
                                        open
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Group Card 5 */}
                        <div className="group-card">
                            <div className="group-card-content">
                                <div className="group-header">
                                    <div className="group-type closed-group">
                                        Closed group
                                    </div>
                                </div>
                                <h3 className="group-title">UI & UX Design</h3>
                                <p className="group-description">
                                    Find out and share what's happening around the globe in UI & UX designs.
                                </p>
                                <div className="group-footer">
                                    <button className="open-btn">
                                        open
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Group Card 6 */}
                        <div className="group-card">
                            <div className="group-card-content">
                                <div className="group-header">
                                    <div className="group-type closed-group">
                                        Closed group
                                    </div>
                                </div>
                                <h3 className="group-title">PHP + MySQL en Español</h3>
                                <p className="group-description">
                                    Este grupo tiene como finalidad unir a programadores hispanohablantes de PHP + MySQL, no importa de donde.
                                </p>
                                <div className="group-footer">
                                    <button className="open-btn">
                                        open
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="create-group-modal">
                        <div className="modal-header">
                            <h3>Create New Group</h3>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group">
                                <label>Group Title</label>
                                <input 
                                    type="text" 
                                    value={newGroupTitle} 
                                    onChange={(e) => setNewGroupTitle(e.target.value)}
                                    placeholder="Enter group title" 
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Group Description</label>
                                <textarea 
                                    value={newGroupDescription} 
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    placeholder="Enter group description" 
                                    required
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Group Type</label>
                                <select 
                                    value={newGroupType} 
                                    onChange={(e) => setNewGroupType(e.target.value)}
                                >
                                    <option value="public">Public Group</option>
                                    <option value="closed">Closed Group</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Invite Users</label>
                                <div className="invite-input-container">
                                    <input 
                                        type="email" 
                                        value={inviteEmail} 
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Enter email address" 
                                    />
                                    <button className="add-invite-btn" onClick={addInvite}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                {inviteList.length > 0 && (
                                    <div className="invite-list">
                                        {inviteList.map((email, index) => (
                                            <div key={index} className="invite-item">
                                                <span>{email}</span>
                                                <button 
                                                    type="button" 
                                                    className="remove-invite" 
                                                    onClick={() => removeInvite(email)}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="create-group-btn">
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;