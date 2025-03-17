"use client"

import CreateCommentCard from "./comment.js";
import { useEffect, useState } from "react";
import { CommentIcon } from '@/components/icons';

const PostCard = ({ PostId, authorName, imageProfileUrl, postTime, postText, imagePostUrl }) => {
    const [showComments, setShowComments] = useState(false);
    const [newImageURL, setImageURL] = useState('');
    const [profileImage, setProfileImage] = useState('/default_profile.jpg');

    const getDownloadImage = async (link, isPost) => {
        try {
            if (link !== '') {
                const res = await fetch(link, {
                    headers: {
                        'Authorization': document.cookie.slice('auth_session='.length),
                    },
                });
                const image = await res.blob();
                const newUrl = URL.createObjectURL(image);
                isPost ? setImageURL(newUrl) : setProfileImage(newUrl)
            }
        } catch (err) {
            console.error("fetching image: ", err);
        }
    };

    useEffect(() => {
        imagePostUrl != '' && getDownloadImage(`http://127.0.0.1:8080/${imagePostUrl}`, true);
        imageProfileUrl != '' && getDownloadImage(`http://127.0.0.1:8080/${imageProfileUrl}`, false);
    }, []);

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author-avatar" style={{
                    backgroundImage: `url(${profileImage})`,
                    backgroundSize: 'cover'
                }}></div>
                <div className="post-info">
                    <div className="post-author-name">{authorName}</div>
                    <div className="post-time">{postTime}</div>
                </div>
            </div>
            <div className="post-content">
                <p className="post-text">{postText}</p>
                {imagePostUrl !== '' && (
                    <div className="post-image"
                        style={{
                            backgroundImage: `url(${newImageURL})`,
                            backgroundSize: 'cover'
                        }}>
                    </div>
                )}
            </div>
            <div className="post-actions">
                <button className="comment-button" onClick={() => setShowComments(!showComments)}>
                    <CommentIcon />
                    <span>Comment</span>
                </button>
            </div>
            {showComments && <CreateCommentCard postId={PostId} />}
        </div>
    );
};

export default PostCard;
