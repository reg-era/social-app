"use client"
import { useState } from "react";

const CreatePostCard = () => {
    const [error, setError] = useState('');
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
                    'Authorization': document.cookie.slice('auth_session='.length) ,
                },
                body: form,
            })

            if (res.ok) {
            } else {
                console.log(await res.json());
                throw new Error('faild to singup');
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
                            <input name="post" type="text" placeholder="What's on your mind?" />
                        </div>

                        <input id="fileInputPost" type="file" style={{ display: 'none' }} />
                        <button className="photo-action" onClick={importFile}>
                            <span>Photo</span>
                        </button>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-button">Post</button>
                </div>
            </div>
        </form>
    );
};

export default CreatePostCard;
