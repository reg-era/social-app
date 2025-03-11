CREATE TRIGGER post_visibility_check
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    INSERT INTO post_viewers (post_id, user_id)
    SELECT NEW.id, follower_id FROM follows
    WHERE following_id = NEW.user_id AND NEW.visibility = 'followers';
END;
