"use client"

import CommentSection from "./comment.js";
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

const PostCard = ({ PostId, authorName, postTime, postText, imagePostUrl }) => {
    const [showComments, setShowComments] = useState(false);
    const [newImageURL, setImageURL] = useState('')
    const getDownloadImage = async () => {
        try {
            if (imagePostUrl !== '') {
                const res = await fetch(`http://127.0.0.1:8080/${imagePostUrl}`, {
                    headers: {
                        'Authorization': document.cookie.slice('auth_session='.length),
                    },
                });
                const image = await res.blob()
                const imgUrl = URL.createObjectURL(image);
                setImageURL(imgUrl)
            }
        } catch (err) {
            console.error("fetching image: ", err);
        }
    }

    useEffect(() => {
        getDownloadImage()
    }, [])
    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author-avatar"></div>
                <div className="post-info">
                    <div className="post-author-name">{authorName}</div>
                    <div className="post-time">{postTime}</div>
                </div>
            </div>
            <div className="post-content">
                <p className="post-text">{postText}</p>
                {imagePostUrl !== '' && <div className="post-image"
                    style={{
                        backgroundImage: `url(${newImageURL})`,
                        backgroundSize: 'cover'
                    }}></div>}
            </div>
            <div className="post-actions">
                <button className="comment-button" onClick={() => setShowComments(!showComments)}>
                    <FontAwesomeIcon icon={faComment} />
                    <span>Comment</span>
                </button>
            </div>
            {showComments && <CommentSection PostId={PostId} />}
        </div>
    );
};

export default PostCard;
