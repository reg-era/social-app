import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const CreatePostCard = () => {
    return (
        <div className="create-post-card">
            <div className="create-post-header">
                <div className="user-avatar"></div>
                <div className="input-actions-container">
                    <div className="input-with-photo">
                        <div className="post-input">
                            <input type="text" placeholder="What's on your mind?" />
                        </div>
                        <button className="photo-action">
                            <FontAwesomeIcon icon={faImage} />
                            <span>Photo</span>
                        </button>
                    </div>
                    <button className="submit-button">
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostCard;
