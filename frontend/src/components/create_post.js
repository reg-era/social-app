"use client"
import { useState,useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faGlobe, faLock, faUserTag, faTimes, faSmile, faSearch } from '@fortawesome/free-solid-svg-icons';
import { EMOJI_CATEGORIES } from "@/utils/emoji";

const CreatePostCard = ({ onCreatePost }) => {
    const [newPost, setNewPost] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState('')
    const [postPrivacy, setPostPrivacy] = useState('public');
    const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
    const [taggedFriends, setTaggedFriends] = useState([]);
    const [friendsList, setFriendsList] = useState([]); // Assuming friendsList comes from somewhere
    const [showTagFriends, setShowTagFriends] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [friendSearchTerm, setFriendSearchTerm] = useState('');

    const emojiPickerRef = useRef(null);
    const friendsDropdownRef = useRef(null);

    const importFile = (e) => {
        e.preventDefault()
        document.getElementById('fileInputPost').click()
    };

    const handlePost = async (e) => {
        e.preventDefault();
        try {
            const post = e.target.post.value
            if (post.length <= 0) {
                return
            }
            const form = new FormData()
            form.append("post", post)
            form.append('image', e.target.fileInputPost.files[0])
            form.append("visibility", 'public')

            const res = await fetch('http://127.0.0.1:8080/api/post', {
                method: 'POST',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: form,
            })

            if (res.ok) {
                const data = await res.json()
                onCreatePost(data);
                setNewPost('');
                setFile('')
            } else {
                throw new Error('faild to singup');
            }
        } catch (error) {
            console.log(error);
            setError('Failed to submit the Post. Please try again.');
        }
    }

    const togglePrivacyOptions = () => {
        setShowPrivacyOptions(!showPrivacyOptions);
    };

    const handlePrivacyChange = (privacy) => {
        setPostPrivacy(privacy);
        setShowPrivacyOptions(false);

        // Clear tagged friends when changing from private to other privacy settings
        if (privacy !== 'private') {
            setTaggedFriends([]);
        }
    };

    const toggleTagFriends = () => {
        setShowTagFriends(!showTagFriends);
        setFriendSearchTerm('');
    };

    const handleAddTag = (friend) => {
        // Check if friend is already tagged
        if (!taggedFriends.some(taggedFriend => taggedFriend.id === friend.id)) {
            setTaggedFriends([...taggedFriends, friend]);
        }
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

    // Search functionality for friends
    const filteredFriends = friendsList.filter(friend =>
        friend.name.toLowerCase().includes(friendSearchTerm.toLowerCase())
    );

    const canTagFriends = postPrivacy === 'private';

    return (
        <form className="create-post-form" onSubmit={handlePost}>
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

                    {/* Tag Friends option now appears ONLY when Private privacy is selected */}
                    {canTagFriends && (
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
                                <div className="friends-dropdown" ref={friendsDropdownRef}>
                                    <div className="friend-search">
                                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search friends..."
                                            value={friendSearchTerm}
                                            onChange={(e) => setFriendSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="friends-list">
                                        {filteredFriends.length > 0 ? (
                                            filteredFriends.map(friend => (
                                                <div
                                                    key={friend.id}
                                                    className="friend-option"
                                                    onClick={() => handleAddTag(friend)}
                                                >
                                                    <span>{friend.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-friends-found">
                                                <span>No friends found</span>
                                            </div>
                                        )}
                                    </div>
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


