'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const GroupInvitations = () => {
    const [pendingInvitations, setPendingInvitations] = useState([]);

    const fetchPendingInvitations = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/api/group/invitations/info', {
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                method: "GET"
            });

            if (response.ok) {
                const data = await response.json();
                setPendingInvitations(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching invitations:', error);
            setPendingInvitations([]);
        }
    };

    useEffect(() => {
        fetchPendingInvitations();
    }, []);

    const handleInvitationResponse = async (groupId, action) => {
        try {
            const formData = new FormData();
            formData.append('group_id', groupId);
            formData.append('action', action);

            const response = await fetch('http://127.0.0.1:8080/api/group/invitation', {
                method: 'PUT',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: formData
            });

            if (response.ok) {
                setPendingInvitations(pendingInvitations.filter(inv => inv.groupId !== groupId));
                alert(`Successfully ${action}ed the invitation`);
            }
        } catch (error) {
            console.error('Error responding to invitation:', error);
            alert('Failed to respond to invitation');
        }
    };

    if (pendingInvitations.length === 0) {
        return null; 
    }

    return (
        <div className="invitations-container">
            <div className="invitations-header">
                <h3>Pending Group Invitations</h3>
            </div>
            <div className="invitations-list">
                {pendingInvitations.map((invitation) => (
                    <div key={invitation.groupId} className="invitation-card">
                        <div className="invitation-info">
                            <h4>{invitation.title}</h4>
                            <p>{invitation.description}</p>
                        </div>
                        <div className="invitation-actions">
                            <button 
                                className="accept-btn"
                                onClick={() => handleInvitationResponse(invitation.groupId, 'accept')}
                            >
                                Accept
                            </button>
                            <button 
                                className="reject-btn"
                                onClick={() => handleInvitationResponse(invitation.groupId, 'reject')}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupInvitations;