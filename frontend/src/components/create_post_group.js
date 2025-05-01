"use client"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile } from '@fortawesome/free-solid-svg-icons';


import { EMOJI_CATEGORIES } from "@/utils/emoji";
import { useState, useRef } from "react";

const CreatePostCardGroup = ({ onCreatePost, groupId }) => {
    const [newPost, setNewPost] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState('')
    const [imagePreview, setImagePreview] = useState(''); // Add state for image preview
    const [fileName, setFileName] = useState(''); // Add state for file name

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const importFile = (e) => {
        e.preventDefault();
        document.getElementById('fileInputPost').click();
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
            const form = new FormData();
            form.append("post", newPost);
            form.append("group_id", groupId);

            if (e.target.fileInputPost.files[0]) {
                const file = e.target.fileInputPost.files[0];
                form.append("image", file);

                // Generate a preview URL for the image
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
            }

            const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/group/post`, {
                method: 'POST',
                headers: {
                    'Authorization': document.cookie.slice('auth_session='.length),
                },
                body: form,
            });

            if (res.ok) {
                const data = await res.json();
                onCreatePost(data);
                setNewPost('');
                setFile('');
                setImagePreview(''); // Clear the image preview after successful post
                setFileName(''); // Clear the file name after successful post
                e.target.fileInputPost.value = ''; // Clear the file input
            } else {
                throw new Error('Failed to create group post');
            }
        } catch (error) {
            console.error(error);
            setError('Failed to submit the Post. Please try again.');
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name); // Set the file name
            setFile(URL.createObjectURL(file)); // Update file state
        }
    };

    return (
        <form className="create-post-card" onSubmit={handlePost}>
            <div className="create-post-header">
                <div className="input-actions-container">
                    <div className="input-with-photo">
                        <div className="post-input">
                            <input name="post" type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Write something to the group..." />
                        </div>

                        <input
                            id="fileInputPost"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileChange} // Use the new handler
                        />
                        <button className="photo-action" onClick={importFile}>
                            <span>Photo</span>
                        </button>

                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                        {/* Add image preview */}
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
            {fileName && (
                <div className="file-name-indicator">
                    <span>Selected file: {fileName}</span>
                </div>
            )}
        </form>
    );
};

export default CreatePostCardGroup;
