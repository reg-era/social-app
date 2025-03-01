const CommentSection = ({postId}) => {
    return (
        <div className="post-comments">
            <div className="comment-item">
                <div className="comment-avatar"></div>
                <div className="comment-content">
                    <div className="comment-author">Jane Smith</div>
                    <div className="comment-text">This looks amazing! Great job!</div>
                </div>
            </div>
            <div className="add-comment">
                <div className="comment-avatar"></div>
                <input type="text" placeholder="Write a comment..." />
            </div>
        </div>
    );
};

export default CommentSection;
