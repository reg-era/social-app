"use client";

import { useAuth } from '@/context/auth_context';
import React, { useEffect, useState } from 'react';

const MembersList = ({ groupId, isGroupCreator }) => {
    const { token, tockenLoading } = useAuth();


    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8080/api/group/members?group_id=${groupId}`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setMembers(data.members || []);
            } else {
                throw new Error('Failed to fetch members');
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [groupId]);

    if (loading) {
        return <div>Loading members...</div>;
    }

    return (
        <div className="members-list">
            <div className="members-header">
                <h3>Group Members ({members.filter(member => member.status === "accepted").length})</h3>
            </div>
            <div className="members-grid">
                {members.length > 0 ? (
                    members.map(member => {
                        if (member.status === "accepted") {
                            return (
                                <div className="member-card" key={member.userId}>
                                    <div className="member-card-avatar"></div>
                                    <div className="member-card-name">{member.userName}</div>
                                    <div className="member-card-role">Member</div>
                                </div>
                            )
                        }
                    })
                ) : (
                    <div className="no-members">
                        <p>No members in this group yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersList;