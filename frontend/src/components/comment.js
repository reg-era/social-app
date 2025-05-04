import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faSmile } from '@fortawesome/free-solid-svg-icons';

import { EMOJI_CATEGORIES } from "@/utils/emoji";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth_context';

const CreateCommentCard = ({ postId }) => {
    const { token, loading } = useAuth();

    const [page, setPage] = useState(0);
    const [comments, setComments] = useState(new Map());
    const [NewComment, setNewComment] = useState('');
    const [file, setFile] = useState('');
    const [error, setError] = useState('');

    const [endOfComment, setEndComment] = useState(false)

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const importFile = (e) => {
        e.preventDefault()
        document.getElementById('fileInputComment').click()
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const insertEmoji = (emoji) => {
        setNewComment(NewComment + emoji);
    };

    const getComments = async () => {
        try {
            const authToken = token;
            if (!authToken) {
                console.error("Authorization token not found");
                return;
            }

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/comment?id=${postId}&page=${page}`, {
                headers: {
                    'Authorization': authToken,
                },
            });
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setComments(prevComm => {
                        const newComments = new Map(prevComm);
                        data.forEach(newComm => {
                            if (!newComments.has(newComm.comment_id)) {
                                newComments.set(newComm.comment_id, newComm);
                            }
                        });
                        return newComments;
                    });
                    if (data.length < 3) {
                        setEndComment(true)
                        return
                    }
                    setPage(() => page + 1);
                }
            } else {
                console.error('Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            const comment = e.target.comment.value.trim()
            if (comment.length <= 0) {
                return
            }
            const form = new FormData()

            form.append("postID", postId)
            form.append("comment", comment)
            form.append('image', e.target.fileInputComment.files[0])

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                },
                body: form,
            })

            const data = await res.json()
            if (res.ok) {
                setComments(prevComm => {
                    const newComments = new Map(prevComm);
                    if (!newComments.has(data.comment_id)) {
                        newComments.set(data.comment_id, data);
                    }
                    return newComments;
                });
                setNewComment('');
                setFile('');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setError(`${error}. Please try again.`);
        }
    }

    useEffect(() => {
        getComments();
    }, [loading]);

    return (
        <div className="post-comments">
            {/* {!endOfComment && <button onClick={(e) => getComments()}>show more</button>} */}
            {[...comments.values()].map((comment) => (<CommentCard key={comment.comment_id} userName={comment.userName} content={comment.content} imageUrl={comment.image_url} />))}
            <div className="add-comment">
                <form className="messageBox" onSubmit={handleComment} >
                    <div className="fileUploadWrapper">
                        <label htmlFor="file">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
                                <circle strokeWidth="20" stroke="#6c6c6c" fill="none" r="158.5" cy="168.5" cx="168.5"></circle>
                                <path strokeLinecap="round" strokeWidth="25" stroke="#6c6c6c" d="M167.759 79V259"></path>
                                <path strokeLinecap="round" strokeWidth="25" stroke="#6c6c6c" d="M79 167.138H259"></path>
                            </svg>
                            <span className="tooltip">Add an image</span>
                        </label>
                        <input id="fileInputComment" type="file" value={file} onChange={(e) => setFile(e.target.value)} style={{ display: 'none' }} />
                        <button type="button" id="file" name="file" className="photo-action" onClick={importFile}></button>
                    </div>

                    <input required id="messageInput" name="comment" type="text" value={NewComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." />

                    <button type="button" className="emoji-action" onClick={toggleEmojiPicker}>
                        <FontAwesomeIcon icon={faSmile} />
                    </button>

                    {showEmojiPicker && (
                        <div className="emoji-picker-container" ref={emojiPickerRef}>
                            <div className="emoji-list">
                                {EMOJI_CATEGORIES.smileys.map((emoji, index) => (
                                    <span key={index} className="emoji-item" onClick={() => insertEmoji(emoji)}>
                                        {emoji}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" id="sendButton" >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
                            <path fill="none" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"></path>
                            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="33.67" stroke="#6c6c6c" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"></path>
                        </svg>
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
};

const CommentCard = ({ userName, content, imageUrl }) => {
    const [newImageURL, setImageURL] = useState('');
    const [profileImage, setProfileImage] = useState('/default_profile.jpg');

    const { token, loading } = useAuth();


    const getDownloadImage = async (link, iscomment) => {
        try {
            if (link !== '') {
                const res = await fetch(link, {
                    headers: {
                        'Authorization': token,
                    },
                });
                const image = await res.blob();
                const newUrl = URL.createObjectURL(image);
                iscomment ? setImageURL(newUrl) : setProfileImage(newUrl)
            }
        } catch (err) {
            console.error("fetching image: ", err);
        }
    };

    useEffect(() => {
        imageUrl != '' && getDownloadImage(`http://${process.env.NEXT_PUBLIC_GOSERVER}/${imageUrl}`, true);
        // imageProfileUrl != '' && getDownloadImage(`http://127.0.0.1:8080/${imageProfileUrl}`, false);
    }, []);

    return (
        <div className="comment-item">
            <div className="comment-avatar" style={{
                backgroundImage: `url(${profileImage})`,
                backgroundSize: 'cover'
            }}
            ></div>
            <div className="comment-content">
                <div className="comment-author">{userName}</div>
                <div className="comment-text">
                    {content}
                    {imageUrl !== '' && (
                        <div className="post-image"
                            style={{
                                backgroundImage: `url(${newImageURL})`,
                                backgroundSize: 'cover'
                            }}>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCommentCard;