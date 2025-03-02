"use client"

import '../style/home.css'
import { useEffect, useState } from 'react';

import Navigation from '../components/navbar.js';
import Sidebar from '../components/sidebar.js';
import CreatePostCard from '../components/create_post.js';
import PostCard from '../components/post.js';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPostId, setNextPostId] = useState();

  const getPosts = async () => {
    setLoading(true);
    const res = await fetch(`http://127.0.0.1:8080/api/post${nextPostId ? `?post_id=${nextPostId}` : ''}`, {
      headers: {
        'Authorization': document.cookie.slice('auth_session='.length),
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.posts) {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        setNextPostId(data.next_id);
      }
    } else {
      console.error('Failed to fetch posts');
    }
    setLoading(false);
  };

  useEffect(() => {
    getPosts();
  }, []);

  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const loadMorePosts = () => {
    if (nextPostId) {
      getPosts(nextPostId);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="main-container">
        <Sidebar />
        <div className="content-area">
          <CreatePostCard onCreatePost={addPost} />
          {posts.map((post) => (
            <PostCard
              key={post.PostId}
              PostId={post.PostId}
              authorName={post.authorName}
              imagePostUrl={post.imagePostUrl}
              postText={post.postText}
              postTime={post.postTime}
            />
          ))}
          {loading && <div>Loading more posts...</div>}
          {!loading && nextPostId && (
            <button onClick={loadMorePosts}>Load More</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
