"use client"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile } from '@fortawesome/free-solid-svg-icons';


import { EMOJI_CATEGORIES } from "@/utils/emoji";
import { useState, useRef } from "react";

const CreatePostCardGroup = ({ onCreatePost, groupId }) => {
    const [newPost, setNewPost] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState('')

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
        setNewPost(newPost + emoji);
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
            form.append("group_id", groupId)

            const res = await fetch('http://127.0.0.1:8080/api/group/post', {
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
                throw new Error('Failed to create group post');
            }
        } catch (error) {
            console.log(error);
            setError('Failed to submit the Post. Please try again.');
        }
    }

    return (
        <form className="create-post-card" onSubmit={handlePost}>
            <div className="create-post-header">
                <div className="input-actions-container">
                    <div className="input-with-photo">
                        <div className="post-input">
                            <input name="post" type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Write something to the group..." />
                        </div>

                        <input id="fileInputPost" type="file" value={file} onChange={(e) => setFile(e.target.value)} style={{ display: 'none' }} />
                        <button className="photo-action" onClick={importFile}>
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
                    <button type="submit" className="submit-button">Post</button>
                </div>
            </div>
        </form>
    );
};

export default CreatePostCardGroup;
