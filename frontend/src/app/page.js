"use client"

import '../style/home.css'

import Navigation from '../components/navbar.js';
import Sidebar from '../components/sidebar.js';
import CreatePostCard from '../components/create_post.js';
import { useState } from 'react';
import PostCard from '@/components/post.js';


let currentPostId
const Home = () => {
  const getPost = async (offset) => {
    const res = await fetch('http://127.0.0.1:8080/api/post', {
      headers: {
        'Authorization': document.cookie.slice('auth_session='.length),
      },
    })

    if (res.ok) {
      const data = await res.json()
      currentPostId = data.next_id
      return data.posts
    }
    return []
  }

  let [posts, setPosts] = useState(getPost());
  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <div>
      <Navigation />
      <div className="main-container">
        <Sidebar />
        <div className="content-area">
          {posts.map((post, _) => (
            <PostCard
              key={post.PostId}
              PostId={post.PostId}
              authorName={post.authorName}
              imagePostUrl={post.imagePostUrl}
              postText={post.postText}
              postTime={post.postTime}
            />
          ))}
        </div>
        <CreatePostCard onCreatePost={addPost} />
      </div>
    </div>
  );
};

export default Home;
