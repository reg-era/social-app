import { useAuth } from '@/context/auth_context';
import { getDownloadImage } from '@/utils/helper';
import React, { useState, useEffect, use } from 'react';

const CreateCommentCardGroup = ({ postId, groupID }) => {
    const { token, loading } = useAuth();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [file, setFile] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [fileName, setFileName] = useState('');
    const [isThrottling, setIsThrottling] = useState(false);

    const getComments = async () => {
        try {
            const authToken = token;
            if (!authToken) {
                console.error("Authorization token not found");
                return;
            }

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/comment?postID=${postId}&groupID=${groupID}`, {
                headers: {
                    'Authorization': authToken,
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setComments(data.reverse());
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
        if (isThrottling) return;
        if (!newComment.trim() && !e.target.fileInputComment.files[0]) return;

        try {
            setIsThrottling(true);

            const formData = new FormData();
            formData.append('groupID', groupID);
            formData.append('postID', postId);
            formData.append('comment', newComment);

            if (e.target.fileInputComment.files[0]) {
                const file = e.target.fileInputComment.files[0];
                formData.append('image', file);
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
                setFile('');
                setImagePreview('');
                setFileName('');
                e.target.fileInputComment.value = '';
            } else {
                const errorData = await response.json();
                console.error('Failed to create comment:', errorData);
            }
        } catch (error) {
            console.error('Error creating comment:', error);
        } finally {
            // Reset throttling after 1 second
            setTimeout(() => {
                setIsThrottling(false);
            }, 1000);
        }
    };

    const importFile = (e) => {
        e.preventDefault();
        document.getElementById('fileInputComment').click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setFile(URL.createObjectURL(file));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        getComments();
    }, []);

    return (
        <div className="post-comments">
            {comments.map((comment) => (
                <CommentCard
                    key={comment.comment_id}
                    userName={`${comment.author_name}`}
                    content={comment.content}
                    image={comment.image_url}
                />
            ))}
            <div className="add-comment">
                <form className="messageBox" onSubmit={handleCreateComment}>
                    <div className="fileUploadWrapper">
                        <label htmlFor="file">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
                                <circle strokeWidth="20" stroke="#6c6c6c" fill="none" r="158.5" cy="168.5" cx="168.5"></circle>
                                <path strokeLinecap="round" strokeWidth="25" stroke="#6c6c6c" d="M167.759 79V259"></path>
                                <path strokeLinecap="round" strokeWidth="25" stroke="#6c6c6c" d="M79 167.138H259"></path>
                            </svg>
                            <span className="tooltip">Add an image</span>
                        </label>
                        <input
                            id="fileInputComment"
                            type="file"
                            name="fileInputComment"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            id="file"
                            name="file"
                            className="photo-action"
                            onClick={importFile}
                        ></button>
                    </div>

                    <input
                        required
                        id="messageInput"
                        name="comment"
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                    />

                    <button type="submit" id="sendButton">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
                            <path fill="none" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"></path>
                            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="33.67" stroke="#6c6c6c" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"></path>
                        </svg>
                    </button>

                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                        </div>
                    )}
                    {fileName && (
                        <div className="file-name-indicator">
                            <span>Selected file: {fileName}</span>
                        </div>
                    )}
                </form>
            </div>

        </div>
    );
};

const CommentCard = ({ userName, content, image }) => {
    const { token, loading } = useAuth();

    useEffect(() => {
        let fetchImage = async () => {
            if (image) {
                const newImage = await getDownloadImage(image, token);
                setNewImage(newImage);
            }
        };
        fetchImage();
    }, [image, token, loading]);
    const [newImage, setNewImage] = useState('');

    return (
        <div className="comment-item">
            <div className="comment-content">
                <div className="comment-author">@{userName}</div>
                <div className="comment-text">{content}</div>
                {image && (
                    <div className="post-image"
                        style={{
                            backgroundImage: `url(${newImage})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'content',
                        }}>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateCommentCardGroup;