CREATE TABLE followers (
    follower_id INTEGER NOT NULL, 
    following_id INTEGER NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status text DEFAULT 'pending',
    PRIMARY KEY (follower_id, following_id),
);