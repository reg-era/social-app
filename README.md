# Social Network Project

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Features](#features)
- [Team & tasks](#team-members)

## Overview

This social network platform includes features such as user authentication, profiles, posts, groups, real-time chat, and notifications.
The global road and news will be marked in this `main` branch so make sure to pull also any feature tested and confirmed will be merge into `dev` branch 

## Tech Stack
please recommand any allowed lib or framework if it will help
### Backend
- Go
- SQLite3
- Gorilla WebSocket
- golang-migrate
- bcrypt for password hashing
- UUID for unique identifiers

### Frontend
- Next.js
- WebSocket client

### Infrastructure
- Docker
- Docker Compose (opt)

## Project Structure
Any new file structure is welcome this struct doesnt follow any pattern so just feel free to suggest
```
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── post/
│   │   ├── group/
│   │   ├── chat/
│   │   └── notification/
│   ├── pkg/
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   │   └── sqlite/
│   │   │   │       ├── 000001_create_users.up.sql
│   │   │   │       ├── 000001_create_users.down.sql
│   │   │   │       └── ... other migrations
│   │   │   └── sqlite.go
│   │   ├── middleware/
│   │   └── websocket/
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Database Schema

### Core Tables
It can change later any suggestion is welcome
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    about_me TEXT,
    date_of_birth DATE NOT NULL,
    avatar_url VARCHAR(255),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follow Requests
CREATE TABLE follow_requests (
    id UUID PRIMARY KEY,
    follower_id UUID REFERENCES users(id),
    following_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

-- Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    privacy VARCHAR(20) NOT NULL,
    group_id UUID REFERENCES groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups
CREATE TABLE groups (
    id UUID PRIMARY KEY,
    creator_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Members
CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    group_id UUID REFERENCES groups(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY,
    group_id UUID REFERENCES groups(id),
    creator_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Responses
CREATE TABLE event_responses (
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    response VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id)
);
```

## Features
any feature is completly tested please mark it with X
### Authentication
- [] User registration
- [] Login/Logout
- [] Session management

### Profile
- [] Public/Private profiles
- [] User information
- [] Activity feed
- [] Followers/Following management

### Posts
- [] Create posts with privacy settings
- [] Image/GIF support
- [] Comments
- [] Privacy controls

### Groups
- [] Create groups
- [] Invite members
- [] Group posts
- [] Events management

### Chat
- [] Private messaging
- [] Group chat
- [] Real-time updates
- [] Emoji support

### Notifications
- [] Follow requests
- [] Group invitations
- [] Event notifications
- [] Real-time updates

## Team Members
anyone is interested in a part or look to take a part mark it down
1. [azzerou]  - ?
2. [msalmi]   - ?
3. [hadaoud]  - ?
4. [yhousai]  - database && api endpoint 
5. [ifoukahi] - Authentication(backend)