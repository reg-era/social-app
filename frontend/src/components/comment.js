import React, { useState, useEffect } from 'react';

const CreateCommentCard = ({ postId }) => {
    const [page, setPage] = useState(0);
    const [comments, setComments] = useState([]);

    const getComments = async () => {
        try {
            const authToken = document.cookie.slice('auth_session='.length);
            if (!authToken) {
                console.error("Authorization token not found");
                return;
            }

            const res = await fetch(`http://127.0.0.1:8080/api/comment?id=${postId}&page=${page}`, {
                headers: {
                    'Authorization': authToken,
                },
            });
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                if (data) {
                    setComments((prevComments) => {
                        const newComments = data.filter(
                            (newComment) => !prevComments.some((existingComment) => existingComment.commentId === newComment.commentId)
                        );
                        return [...prevComments, ...newComments];
                    });
                    setPage((prevPage) => prevPage + 1);
                }
            } else {
                console.error('Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        getComments();
    }, []);

    return (
        <div className="post-comments">
            {comments.map((comment) => (
                <CommentCard
                    key={comment.commentId}
                    userName={comment.userName}
                    content={comment.content}
                />
            ))}
            <div className="add-comment">
                <div className="comment-avatar"></div>
                <div className="messageBox">
                    <div className="fileUploadWrapper">
                        <label htmlFor="file">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
                                <circle strokeWidth="20" stroke="#6c6c6c" fill="none" r="158.5" cy="168.5" cx="168.5"></circle>
                                <path strokeLinecap="round" strokeWidth="25" stroke="#6c6c6c" d="M167.759 79V259"></path>
                                <path strokeLinecap="round" strokeWidth="25" stroke="#6c6c6c" d="M79 167.138H259"></path>
                            </svg>
                            <span className="tooltip">Add an image</span>
                        </label>
                        <input type="file" id="file" name="file" />
                    </div>
                    <input required placeholder="Write a comment..." type="text" id="messageInput" />
                    <button id="sendButton">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
                            <path fill="none" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"></path>
                            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="33.67" stroke="#6c6c6c" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const CommentCard = ({ userName, content }) => {
    return (
        <div className="comment-item">
            <div className="comment-avatar"></div>
            <div className="comment-content">
                <div className="comment-author">{userName}</div>
                <div className="comment-text">{content}</div>
            </div>
        </div>
    );
};

export default CreateCommentCard;
