import { useAuth } from '@/context/auth_context';
import React, { useState, useEffect } from 'react';

const CreateCommentCardGroup = ({ postId, groupID }) => {
    const { token, loading } = useAuth();


    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [file, setFile] = useState(null); // Add this line

    const getComments = async () => {
        try {
            const authToken = token;
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
            if (file) {
                formData.append('image', file); // Add the image file
            }

            const response = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                },
                body: formData
            });

            if (response.ok) {
                const newCommentData = await response.json();
                setComments(prevComments => [...prevComments, newCommentData]);
                setNewComment('');
                setFile(null); // Reset the file input
            } else {
                console.error('Failed to create comment');
            }
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };

    useEffect(() => {
        if (!loading) return;
        getComments();
    }, [loading]);

    return (
        <div className="post-comments">
            {comments.map((comment, index) => (
                console.log("this is the comment content", comment.author_name
                ),
                <CommentCard
                    key={index}
                    userName={comment.author_name}
                    content={comment.content}
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
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <button type="submit">Post</button>
            </form>
        </div>
    );
};

const CommentCard = ({ userName, content }) => {
    console.log("dfsdf", userName, content);

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