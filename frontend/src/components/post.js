import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import Comment from './Comment';

const PostCard = ({ author, time, content, comments }) => {
    const [commentText, setCommentText] = useState(''); // Initialize with an empty string
    const [commentList, setCommentList] = useState(comments || []);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            const newComment = {
                author: 'You', // will be replaced with the user's name
                text: commentText,
                time: 'Just now' // will be replaced with the current time
            };
            setCommentList([...commentList, newComment]);
            setCommentText('');
        }
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author-avatar"></div>
                <div className="post-info">
                    <div className="post-author-name">{author}</div>
                    <div className="post-time">{time}</div>
                </div>
                <div className="post-options">
                    <FontAwesomeIcon icon={faEllipsisH} />
                </div>
            </div>
            <div className="post-content">
                <p className="post-text">{content}</p>
                <div className="post-image"></div>
            </div>
            <div className="post-stats">
                <div className="comments">{commentList.length} comments</div>
            </div>
            <div className="post-actions">
                <button className="comment-button">
                    <FontAwesomeIcon icon={faComment} />
                    <span>Comment</span>
                </button>
            </div>
            <div className="post-comments">
                {commentList.map((comment, index) => (
                    <Comment 
                        key={index}
                        author={comment.author}
                        text={comment.text}
                        time={comment.time}
                    />
                ))}
                <div className="add-comment">
                    <div className="comment-avatar"></div>
                    <form onSubmit={handleCommentSubmit}>
                        <input 
                            type="text" 
                            placeholder="Write a comment..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostCard;