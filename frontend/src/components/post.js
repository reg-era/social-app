import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faComment } from '@fortawesome/free-solid-svg-icons';

const PostCard = ({ authorName, postTime, postText, commentsCount }) => {
    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author-avatar"></div>
                <div className="post-info">
                    <div className="post-author-name">{authorName}</div>
                    <div className="post-time">{postTime}</div>
                </div>
                <div className="post-options">
                    <FontAwesomeIcon icon={faEllipsisH} />
                </div>
            </div>
            <div className="post-content">
                <p className="post-text">{postText}</p>
            </div>
            <div className="post-stats">
                <div className="comments">{commentsCount} comments</div>
            </div>
            <div className="post-actions">
                <button className="comment-button">
                    <FontAwesomeIcon icon={faComment} />
                    <span>Comment</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
