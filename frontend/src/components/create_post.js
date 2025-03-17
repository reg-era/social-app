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

};

export default CreatePostCard;
