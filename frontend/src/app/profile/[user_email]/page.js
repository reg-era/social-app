'use client';

import '@/style/profile.css';

import { useState, useEffect } from 'react';
import Navigation from '@/components/navbar';
import BackHome from '@/components/back_home';
import { ProfileHeader, ProfilePost, ProfileFollower } from '@/components/profile';

const ForeingProfile = ({ params }) => {
    const [userEmail, setUserEmail] = useState('');
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        if (params) {
            params.then((resolvedParams) => {
                const decodedEmail = decodeURIComponent(resolvedParams?.user_email || '');
                setUserEmail(decodedEmail);
            });
        }
    }, [params]);
    return (
        <div>
            <Navigation />
            <div className="profile-container">
                <ProfileHeader setActiveTab={setActiveTab} userEmail={userEmail} />

                <div className="profile-content">
                    <div className="profile-tabs">
                        <div className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</div>
                        <div className={`profile-tab ${activeTab === 'followers' ? 'active' : ''}`} onClick={() => setActiveTab('followers')}>Followers</div>
                        <div className={`profile-tab ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>Following</div>
                    </div>

                    <div className="profile-tab-content">
                        {activeTab === 'posts' && <ProfilePost userEmail={userEmail} />}
                        {activeTab === 'followers' && <ProfileFollower activeTab={activeTab} userEmail={userEmail} />}
                        {activeTab === 'following' && <ProfileFollower activeTab={activeTab} userEmail={userEmail} />}
                    </div>
                </div>
            </div>

            <BackHome />
        </div>
    )
}

export default ForeingProfile;

/*
<div className="private-profile-message">
    <LockIcon size="3x" />
    <h2>This Profile is Private</h2>
    <p>Follow this user to see their posts and other information.</p>
    <button className="follow-btn" onClick={toggleFollow}>
        <UserPlusIcon /> Follow
    </button>
</div>
*/