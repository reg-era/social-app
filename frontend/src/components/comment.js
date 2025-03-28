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
                        const res = [...prevComments, ...newComments]

                        return res
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
                <input type="text" placeholder="Write a comment..." />
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