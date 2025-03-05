CREATE TABLE GROUPS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url VARCHAR(255),
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
);