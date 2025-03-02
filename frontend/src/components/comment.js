import React from 'react';

const Comment = ({ author, text, time }) => {
    return (
        <div className="comment-item">
            <div className="comment-avatar"></div>
            <div className="comment-content">
                <div className="comment-author">{author}</div>
                <div className="comment-text">{text}</div>
                <div className="comment-actions">
                    <span className="comment-reply">Reply</span>
                    <span className="comment-time">{time}</span>
                </div>
            </div>
        </div>
    );
};

export default Comment;