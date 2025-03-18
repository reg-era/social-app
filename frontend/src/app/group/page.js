'use client';

import '@/style/home.css';
import '@/style/group.css';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Import existing components
import Navigation from '@/components/navbar';
import Sidebar from '@/components/sidebar';

const GroupsPage = () => {
  // State variables
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupType, setNewGroupType] = useState('public');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteList, setInviteList] = useState([]);

  // Fetch groups on mount
  const fetchGroups = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/group', {
        headers: {
          'Authorization': document.cookie.slice('auth_session='.length),
        },
        method: "GET"
      });
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Create group handler
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('group_name', newGroupTitle);
    formData.append('description', newGroupDescription);
    formData.append('type', newGroupType);

    try {
      const response = await fetch('http://127.0.0.1:8080/api/group', {
        method: 'POST',
        headers: {
          'Authorization': document.cookie.slice('auth_session='.length),
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();

        // Send invitations
        for (const email of inviteList) {
          const inviteFormData = new FormData();
          inviteFormData.append('group_id', result.group_id);
          inviteFormData.append('action', 'invite');
          inviteFormData.append('user_id', email);

          await fetch('http://127.0.0.1:8080/api/group', {
            method: 'PUT',
            headers: {
              'Authorization': document.cookie.slice('auth_session='.length),
            },
            body: inviteFormData
          });
        }

        fetchGroups();
        setShowCreateModal(false);
        setNewGroupTitle('');
        setNewGroupDescription('');
        setNewGroupType('public');
        setInviteList([]);
      } else {
        console.error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Invitation management
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
      <Navigation />
      <div className="main-container">
        <Sidebar />

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
            {groups.length > 0 ? (
              groups.map((group) => (
                <div className="group-card" key={group.id}>
                  <div className="group-card-content">
                    <div className="group-header">
                      <div className={`group-type ${group.type === 'public' ? 'public-group' : 'closed-group'}`}>
                        {group.type === 'public' ? 'Public group' : 'Closed group'}
                      </div>
                    </div>
                    <h3 className="group-title">{group.title}</h3>
                    <p className="group-description">{group.description}</p>
                    <div className="group-footer">
                      <div className="group-meta">
                        <span>Members: {group.member_count || 0}</span>
                        <span>•</span>
                        <span>Created by: {group.creator_email}</span>
                      </div>
                      <Link href={`/group/${group.id}`}>
                        <button className="open-btn">OPEN</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No groups found</div>
            )}
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
                />
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