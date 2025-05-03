"use client"

import CreateCommentCard from "./comment.js";
import CreateCommentCardGroup from "./create_comment_card_group.js";
import { useEffect, useState } from "react";
import { CommentIcon } from '@/utils/icons.js';
import { useAuth } from "@/context/auth_context.js";
import { timeAgo } from "@/utils/helper.js";

const PostCard = ({ PostId, authorName, imageProfileUrl, postTime, postText, imagePostUrl, groupId, isGroupPost }) => {
    const { token, loading } = useAuth();

    const [showComments, setShowComments] = useState(false);
    const [newImageURL, setImageURL] = useState('');
    const [profileImage, setProfileImage] = useState('/default_profile.jpg');

    const getDownloadImage = async (link, isPost) => {
        try {
            if (link !== '') {
                const res = await fetch(link, {
                    headers: {
                        'Authorization': token,
                    },
                });
                const image = await res.blob();
                const newUrl = URL.createObjectURL(image);
                isPost ? setImageURL(newUrl) : setProfileImage(newUrl)
            }
        } catch (err) {
            console.error("fetching image: ", err);
        }
    };

    useEffect(() => {
        if (imagePostUrl !== '') {
            getDownloadImage(`http://${process.env.NEXT_PUBLIC_GOSERVER}/${imagePostUrl}`, true); // Correct URL for group posts
        }
        if (imageProfileUrl !== '') {
            getDownloadImage(`http://${process.env.NEXT_PUBLIC_GOSERVER}/${imageProfileUrl}`, false);
        }
    }, [imagePostUrl, loading, imageProfileUrl]); // Add dependencies

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author-avatar" style={{
                    backgroundImage: `url(${profileImage})`,
                    backgroundSize: 'cover'
                }}></div>
                <div className="post-info">
                    <div className="post-author-name">{authorName}</div>
                    <div className="post-time">{timeAgo(postTime)}</div>
                </div>
            </div>
            <div className="post-content">
                <p className="post-text">{postText}</p>
                {imagePostUrl !== '' && (
                    <div className="post-image"
                        style={{
                            backgroundImage: `url(${newImageURL})`,
                            backgroundSize: 'cover'
                        }}>
                    </div>
                )}
            </div>
            <div className="post-actions">
                <button className="comment-button" onClick={() => setShowComments(!showComments)}>
                    <CommentIcon />
                    <span>Comment</span>
                </button>
            </div>
            {showComments && (
                isGroupPost ? (
                    <CreateCommentCardGroup postId={PostId} groupID={groupId} />
                ) : (
                    <CreateCommentCard postId={PostId} />
                )
            )}
        </div>
    );
};

export default PostCard;
