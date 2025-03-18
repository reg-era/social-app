"use client"
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faGlobe, faLock, faUserTag, faTimes, faSmile } from '@fortawesome/free-solid-svg-icons';
import { EMOJI_CATEGORIES } from './emojiMaps';

const CreatePostCard = ({ onCreatePost }) => {
    const [newPost, setNewPost] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState('');
    const [postPrivacy, setPostPrivacy] = useState('public');
    const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
    const [taggedFriends, setTaggedFriends] = useState([]);
    const [friendsList, setFriendsList] = useState([]); // Assuming friendsList comes from somewhere
    const [showTagFriends, setShowTagFriends] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    // Ref for the emoji picker container
    const emojiPickerRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const importFile = (e) => {
        e.preventDefault();
        document.getElementById('fileInputPost').click();
    };

    const togglePrivacyOptions = () => {
        setShowPrivacyOptions(!showPrivacyOptions);
    };

    const handlePrivacyChange = (privacy) => {
        setPostPrivacy(privacy);
        setShowPrivacyOptions(false);
    };

    const toggleTagFriends = () => {
        setShowTagFriends(!showTagFriends);
    };

    const handleAddTag = (friend) => {
        setTaggedFriends([...taggedFriends, friend]);
    };

    const removeTag = (friendId) => {
        setTaggedFriends(taggedFriends.filter(friend => friend.id !== friendId));
    };
    
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };
    
    const insertEmoji = (emoji) => {
        setNewPost(newPost + emoji);
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        try {
            const postText = e.target.post.value;
            if (postText.trim().length <= 0) {
                return;
            }

            const formData = new FormData();
            formData.append("post", postText);
            
            // Only append file if selected
            const fileInput = document.getElementById('fileInputPost');
            if (fileInput.files[0]) {
                formData.append('image', fileInput.files[0]);
            }
            
            formData.append("visibility", postPrivacy);

            const res = await fetch('http://127.0.0.1:8080/api/post', {
                method: 'POST',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                onCreatePost(data);
                setNewPost('');
                setFile('');
                setTaggedFriends([]);
            } else {
                throw new Error('Failed to submit the Post');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to submit the Post. Please try again.');
        }
    };

    return (
        <form className="create-post-form" onSubmit={handlePostSubmit}>
            <div className="create-post-container">
                <div className="create-post-header">
                    <div className="input-actions-container">
                        <div className="input-with-photo">
                            <div className="post-input">
                                <input 
                                    name="post" 
                                    type="text" 
                                    value={newPost} 
                                    onChange={(e) => setNewPost(e.target.value)} 
                                    placeholder="What's on your mind?" 
                                />
                            </div>
                            
                            <input 
                                id="fileInputPost" 
                                type="file" 
                                value={file} 
                                onChange={(e) => setFile(e.target.value)} 
                                style={{ display: 'none' }} 
                            />
                            <button type="button" className="photo-action" onClick={importFile}>
                                <FontAwesomeIcon icon={faImage} />
                                <span>Photo</span>
                            </button>
                            
                            <button type="button" className="emoji-action" onClick={toggleEmojiPicker}>
                                <FontAwesomeIcon icon={faSmile} />
                                <span>Emoji</span>
                            </button>
                        </div>
                        
                        {showEmojiPicker && (
                            <div className="emoji-picker-container" ref={emojiPickerRef}>
                                <div className="emoji-list">
                                    {EMOJI_CATEGORIES.smileys.map((emoji, index) => (
                                        <span 
                                            key={index} 
                                            className="emoji-item" 
                                            onClick={() => insertEmoji(emoji)}
                                        >
                                            {emoji}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
                
                <div className="post-options">
                    <div className="privacy-selector">
                        <button 
                            type="button" 
                            className="privacy-toggle" 
                            onClick={togglePrivacyOptions}
                        >
                            {postPrivacy === 'public' ? (
                                <>
                                    <FontAwesomeIcon icon={faGlobe} />
                                    <span>Public</span>
                                </>
                            ) : postPrivacy === 'private' ? (
                                <>
                                    <FontAwesomeIcon icon={faLock} />
                                    <span>Private</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faUserTag} />
                                    <span>Friends</span>
                                </>
                            )}
                        </button>
                        
                        {showPrivacyOptions && (
                            <div className="privacy-dropdown">
                                <div 
                                    className="privacy-option" 
                                    onClick={() => handlePrivacyChange('public')}
                                >
                                    <FontAwesomeIcon icon={faGlobe} />
                                    <span>Public</span>
                                </div>
                                <div 
                                    className="privacy-option" 
                                    onClick={() => handlePrivacyChange('friends')}
                                >
                                    <FontAwesomeIcon icon={faUserTag} />
                                    <span>Friends</span>
                                </div>
                                <div 
                                    className="privacy-option" 
                                    onClick={() => handlePrivacyChange('private')}
                                >
                                    <FontAwesomeIcon icon={faLock} />
                                    <span>Private</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Tag Friends option only appears when Friends privacy is selected */}
                    {postPrivacy === 'private' && (
                        <div className="tag-friends">
                            <button 
                                type="button" 
                                className="tag-toggle" 
                                onClick={toggleTagFriends}
                            >
                                <FontAwesomeIcon icon={faUserTag} />
                                <span>Tag Friends</span>
                            </button>
                            
                            {showTagFriends && (
                                <div className="friends-dropdown">
                                    {friendsList.map(friend => (
                                        <div 
                                            key={friend.id} 
                                            className="friend-option" 
                                            onClick={() => handleAddTag(friend)}
                                        >
                                            <span>{friend.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <button type="submit" className="submit-button">Post</button>
                </div>
                
                {taggedFriends.length > 0 && (
                    <div className="tagged-friends">
                        <p>Tagged:</p>
                        <div className="tags-container">
                            {taggedFriends.map(friend => (
                                <div key={friend.id} className="friend-tag">
                                    <span>{friend.name}</span>
                                    <button 
                                        type="button" 
                                        className="remove-tag" 
                                        onClick={() => removeTag(friend.id)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
};

export default CreatePostCard;