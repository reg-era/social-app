"use client"
import { useState } from "react";
import { FileUploadIcon } from "@/components/icons";

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

    return (
        <form className="create-post-card" onSubmit={handlePost}>
            <div className="create-post-header">
                <div className="input-actions-container">
                    <div className="input-with-photo">
                        {/* add select cases for visibility from this values{ ('public', 'followers', 'private') } */}
                        <div className="post-input">
                            <input name="post" type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's on your mind?" />
                        </div>

                        <input id="fileInputPost" type="file" value={file} onChange={(e) => setFile(e.target.value)} style={{ display: 'none' }} />
                        <div className="fileUploadIcon">
                        <label htmlFor="file">
                            <FileUploadIcon />
                        </label>
                        <input type="file" id="file" name="file" />
                    </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-button">Post</button>
                </div>
            </div>
        </form>
    );
};

export default CreatePostCard;
