import React, { useState, useEffect } from 'react';

const CreateCommentCardGroup = ({ postId, groupID }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const getComments = async () => {
        try {
            const authToken = document.cookie.slice('auth_session='.length);
            if (!authToken) {
                console.error("Authorization token not found");
                return;
            }

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/comment?post_id=${postId}`, {
                headers: {
                    'Authorization': authToken,
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setComments(data);
                }
            } else {
                console.error('Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleCreateComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const formData = new FormData();
            formData.append('group_id', groupID);
            formData.append('post_id', postId);
            formData.append('comment', newComment);

            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: formData
            });

            if (response.ok) {
                const newCommentData = await response.json();
                setComments(prevComments => [...prevComments, newCommentData]);
                setNewComment('');
            } else {
                console.error('Failed to create comment');
            }
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };

    useEffect(() => {
        getComments();
    }, []);

    return (
        <div className="post-comments">
            {comments.map((comment) => (
                <CommentCard
                    key={comment.CommentId}
                    userName={`${comment.user.firstName} ${comment.user.lastName}`}
                    content={comment.commentText}
                />
            ))}
            <form className="add-comment" onSubmit={handleCreateComment}>
                <div className="comment-avatar"></div>
                <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" ></button>
            </form>
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

export default CreateCommentCardGroup;