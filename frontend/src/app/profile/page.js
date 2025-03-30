'use client';

import '@/style/profile.css';
import { useState } from 'react';

import Navigation from '@/components/navbar';
import BackHome from '@/components/back_home';
import { ProfileHeader, ProfilePost, ProfileFollower } from '@/components/profile';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('posts');

    return (
        <div>
            <Navigation />
            <div className="profile-container">
                <ProfileHeader setActiveTab={setActiveTab} />

                <div className="profile-content">
                    <div className="profile-tabs">
                        <div className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</div>
                        <div className={`profile-tab ${activeTab === 'followers' ? 'active' : ''}`} onClick={() => setActiveTab('followers')}>Followers</div>
                        <div className={`profile-tab ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>Following</div>
                    </div>

                    <div className="profile-tab-content">
                        {activeTab === 'posts' && <ProfilePost />}
                        {activeTab === 'followers' && <ProfileFollower activeTab={activeTab}/>}
                        {activeTab === 'following' && <ProfileFollower activeTab={activeTab}/>}
                    </div>
                </div>
            </div>

            <BackHome />
        </div>
    );
};

export default ProfilePage;
