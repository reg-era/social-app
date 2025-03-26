import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage,faSmile   } from '@fortawesome/free-solid-svg-icons';

import { EMOJI_CATEGORIES } from "@/utils/emoji";

import { useState,useEffect,useRef } from 'react';

const CreateCommentCard = ({ postId }) => {
    const [page, setPage] = useState(0);
    const [comments, setComments] = useState(new Map());
    const [NewComment,setNewComment] = useState('');
    const [file, setFile] = useState('');
    const [error, setError] = useState('');

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const importFile = (e) => {
        e.preventDefault()
        document.getElementById('fileInputPost').click()
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const insertEmoji = (emoji) => {
        setNewComment(NewComment + emoji);
    };

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
                    setComments(prevComm => {
                        const newComments = new Map(prevComm);
                        data.forEach(newComm => {
                            if (!newComments.has(newComm.comment_id)) {
                                newComments.set(newComm.comment_id, newComm);
                            }
                        });
                        return newComments;
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

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            const comment = e.target.comment.value
            if (comment.length <= 0) {
                return
            }
            const form = new FormData()
            
            form.append("postID", postId)
            form.append("comment", comment)
            form.append('image', e.target.fileInputComment.files[0])

            const res = await fetch('http://127.0.0.1:8080/api/comment', {
                method: 'POST',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: form,
            })

            if (res.ok) {
                const data = await res.json()
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
                throw new Error('Failed to create group post');
            }
        } catch (error) {
            console.log(error);
            setError('Failed to submit the Post. Please try again.');
        }
    }

    useEffect(() => {
        getComments();
    }, []);

    return (
        <div className="post-comments">
            {[...comments.values()].map((comment) => (<CommentCard key={comment.comment_id} userName={comment.userName} content={comment.content} imageUrl={comment.image_url}/>))}
            <div className="add-comment">
                <div className="comment-avatar"></div>
                <form className="input-actions-container" onSubmit={handleComment} >
                    <div className="input-with-photo">
                        <div className="comment-input">
                            <input name="comment" type="text" value={NewComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." />
                        </div>
                        
                        <input name="fileInputComment" type="file" value={file} onChange={(e) => setFile(e.target.value)} style={{ display: 'none' }} />
                        <button type="button" className="photo-action" onClick={importFile}>
                            <FontAwesomeIcon icon={faImage} />
                        </button>
                        
                        <button type="button" className="emoji-action" onClick={toggleEmojiPicker}>
                            <FontAwesomeIcon icon={faSmile} />
                        </button>
                    </div>
                    
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

                    <button type="submit" className="submit-button">Post</button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
};

const CommentCard = ({ userName, content ,imageUrl }) => {
    const [newImageURL, setImageURL] = useState('');
    const [profileImage, setProfileImage] = useState('/default_profile.jpg');

    const getDownloadImage = async (link, iscomment) => {
        try {
            if (link !== '') {
                const res = await fetch(link, {
                    headers: {
                        'Authorization': document.cookie.slice('auth_session='.length),
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
        imageUrl != '' && getDownloadImage(`http://127.0.0.1:8080/${imageUrl}`, true);
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