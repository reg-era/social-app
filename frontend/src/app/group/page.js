'use client';
import React, { useState, useEffect } from 'react';

function Group() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('group_name', groupName);
    formData.append('description', description);

    try {
      const response = await fetch('http://127.0.0.1:8080/api/group', {
        method: 'POST',
        headers: {
          'Authorization': document.cookie.slice('auth_session='.length),
        },
        body: formData
      });

      if (response.ok) {
        fetchGroups();
        setGroupName('');
        setDescription('');
      } else {
        console.error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

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

  return (
    <main>
      <h1>Groups</h1>
      
      <div>
        <h2>Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <button type="submit">
              Create Group
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2>All Groups</h2>
        {groups && groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.id}>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              <div>
                <span>Members: {group.member_count || 0}</span>
                <span>•</span>
                <span>Created by: {group.creator_email}</span>
              </div>
            </div>
          ))
        ) : (
          <div>No groups</div>
        )}
      </div>
    </main>
  );
}

export default Group;
