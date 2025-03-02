"use client"

import CommentSection from "./comment.js";
import { useState } from "react";

const PostCard = ({ PostId, authorName, postTime, postText, imagePostUrl }) => {
    const [showComments, setShowComments] = useState(false);
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
                {imagePostUrl !== '' && <div className="post-image" style={{ backgroundImage: `url(http://127.0.0.1:8080/${imagePostUrl})` }}></div>}
            </div>
            <div className="post-actions">
                <button className="comment-button" onClick={() => setShowComments(!showComments)}>
                    <span>Comment</span>
                </button>
            </div>
            {showComments && <CommentSection PostId={PostId} />}
        </div>
    );
};

export default PostCard;
