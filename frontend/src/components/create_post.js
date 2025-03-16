"use client"
import { useState } from "react";

const CreatePostCard = ({ onCreatePost }) => {
    const [newPost, setNewPost] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState('')

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
                                    </div>
                                    
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
                                {postPrivacy === 'friends' && (
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
