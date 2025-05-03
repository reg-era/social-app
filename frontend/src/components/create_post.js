'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faGlobe, faLock, faUserTag, faTimes, faSmile } from '@fortawesome/free-solid-svg-icons';
import { EMOJI_CATEGORIES } from "@/utils/emoji";

import { useState, useRef, useEffect } from "react";
import { useAuth } from '@/context/auth_context';

const CreatePostCard = ({ onCreatePost }) => {
    const { token, loading } = useAuth();

    const [newPost, setNewPost] = useState('');

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const [file, setFile] = useState('')

    const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
    const [postPrivacy, setPostPrivacy] = useState('public');

    const [error, setError] = useState('');

    const [showTagFriends, setShowTagFriends] = useState(false);
    const [taggedFriends, setTaggedFriends] = useState([]);
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/search?target=nothing&nich=close`, {
                    headers: {
                        'Authorization': token,
                    },
                })

                if (res.ok) {
                    const data = await res.json()
                    setFriendsList(data);
                }
            } catch (error) {
                console.error('Failed to fetch friends:', error);
            }
        };

        !loading && fetchFriends();
    }, [loading]);

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
        e.preventDefault()
        document.getElementById('fileInputPost').click()
    };

    const handlePost = async (e) => {
        e.preventDefault();
        try {
            const post = e.target.post.value.trim()
            if (post.length <= 0) {
                return
            }
            const form = new FormData()
            form.append("post", post)
            form.append('image', e.target.fileInputPost.files[0])
            form.append("visibility", postPrivacy)

            if (postPrivacy === 'private') {
                taggedFriends.forEach((user, index) => {
                    form.append(`tagged[email][${index}]`, user.email)
                })
            }

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/post`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                },
                body: form,
            })

            if (res.ok) {
                const data = await res.json()
                onCreatePost(data);
                setNewPost('');
                setFile('')
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
    };

    const handleAddTag = (friend) => {
        // Check if friend is already tagged
        if (!taggedFriends.some(taggedFriend => taggedFriend.email === friend.email)) {
            setTaggedFriends([...taggedFriends, friend]);
        }
        setShowTagFriends(false);
    };

    const removeTag = (friendId) => {
        setTaggedFriends(taggedFriends.filter(friend => friend.email !== friendId));
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const insertEmoji = (emoji) => {
        setNewPost(newPost + emoji);
    };
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
                                    onClick={() => handlePrivacyChange('followers')}
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

                    {/* Tag Friends option appears when Private privacy is selected */}
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
                                    {friendsList.map((friend, index) => (
                                        <div
                                            key={index}
                                            className="friend-option"
                                            onClick={() => handleAddTag(friend)}
                                        >
                                            <span>{`${friend.firstName} ${friend.lastName}`}</span>
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
                            {taggedFriends.map((friend, index) => (
                                <div key={index} className="friend-tag">
                                    <span>{`${friend.firstName} ${friend.lastName}`}</span>
                                    <button
                                        type="button"
                                        className="remove-tag"
                                        onClick={() => removeTag(friend.email)}
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