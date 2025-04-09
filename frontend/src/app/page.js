"use client"

import '../style/home.css'
import { useEffect, useState } from 'react';

import Navigation from '@/components/navbar.js';
import Sidebar from '@/components/sidebar.js';
import CreatePostCard from '@/components/create_post.js';
import PostCard from '@/components/post.js';
import { useAuth } from '@/context/auth_context';
import { getDownloadImage } from '@/utils/helper';

const Home = () => {
  const { token, loading } = useAuth();

  const [posts, setPosts] = useState(new Map());
  const [page, setPage] = useState(0);
  const [isThrottling, setIsThrottling] = useState(false);

  const saveUserInfos = async () => {
    console.log('saving data');
    try {
      const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/user`, {
        headers: {
          'Authorization': document.cookie.slice('auth_session='.length),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const downloaded = await getDownloadImage(data.avatarUrl)
        data.avatarUrl = (downloaded === null) ? '/default_profile.jpg' : downloaded;
        localStorage.setItem('user_info', JSON.stringify(data))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getPosts = async () => {
    const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/post${`?page=${page}`}`, {
      headers: {
        'Authorization': token,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setPosts(prevPosts => {
        const newPosts = new Map(prevPosts);
        data.forEach(newPost => {
          if (!newPosts.has(newPost.PostId)) {
            newPosts.set(newPost.PostId, newPost);
          }
        });
        return newPosts;
      });
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (!loading) {
      getPosts();
    }
  }, [loading]);

  useEffect(() => {
    const handleScroll = () => {
      if (isThrottling) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;

      if (scrollHeight - scrollPosition <= scrollHeight * 0.25) {
        setIsThrottling(true);
        setTimeout(() => {
          getPosts()
          setIsThrottling(false);
        }, 500);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isThrottling]);

  return (
    <div>
      <Navigation />
      <div className="main-container">
        <Sidebar />
        <div className="content-area">
          <CreatePostCard onCreatePost={(data) => {
            const newMap = new Map()
            newMap.set(data.PostId, data)
            posts.forEach((elem) => {
              newMap.set(elem.PostId, elem)
            })
            setPosts(newMap)
          }} />
          {[...posts.values()].map(post => (
            <PostCard
              key={post.PostId}
              PostId={post.PostId}
              authorName={post.user.firstName + post.user.lastName}
              imageProfileUrl={post.user.avatarUrl}
              imagePostUrl={post.imagePostUrl}
              postText={post.postText}
              postTime={post.postTime}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;