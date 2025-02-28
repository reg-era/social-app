CREATE TABLE posts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    shown_to VARCHAR(20) NOT NULL DEFAULT 'all',
    group_id UUID REFERENCES groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);