import '../style/home.css'

import Navigation from '../components/navbar.js';
import Sidebar from '../components/sidebar.js';
import CreatePostCard from '../components/create_post.js';
import PostCard from '../components/post.js';
import CommentSection from '../components/comment.js';

const Home = () => {
  return (
    <div>
      <Navigation />

      <div className="main-container">
        <Sidebar />

        <div className="content-area">
          <CreatePostCard />
          
          <PostCard 
            authorName="chiwa7ed" 
            postTime="2 hours ago" 
            postText="tikchbila twiliwla" 
            commentsCount={36} 
          />
          {/* <CommentSection /> */}

          <PostCard 
            authorName="Web Development Group" 
            postTime="5 hours ago" 
            postText="Our next meetup will be on Friday at 7 PM. We'll be discussing the latest frontend frameworks!" 
            commentsCount={12} 
          />
          {/* <CommentSection /> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
