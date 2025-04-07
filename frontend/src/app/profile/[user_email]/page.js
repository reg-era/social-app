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
                <ProfileHeader isOwnProfile={false} setActiveTab={setActiveTab} userEmail={userEmail} />

                {activeTab !== 'none' &&
                    <div className="profile-content">
                        <div className="profile-tabs">
                            <div className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</div>
                            <div className={`profile-tab ${activeTab === 'followers' ? 'active' : ''}`} onClick={() => setActiveTab('followers')}>Followers</div>
                            <div className={`profile-tab ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>Following</div>
                        </div>

                        <div className="profile-tab-content">
                            {activeTab === 'posts' && <ProfilePost isOwnProfile={false} userEmail={userEmail} />}
                            {activeTab === 'followers' && <ProfileFollower isOwnProfile={false} activeTab={activeTab} userEmail={userEmail} />}
                            {activeTab === 'following' && <ProfileFollower isOwnProfile={false} activeTab={activeTab} userEmail={userEmail} />}
                        </div>
                    </div>
                }
            </div>

            <BackHome />
        </div>
    )
}

export default ForeingProfile;