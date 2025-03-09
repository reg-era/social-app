# Front-End Task Guide

## Overview

This document provides guidance for fetching user data and related information from the backend and using it in the front-end. You will be interacting with a REST API running at `localhost:8080`.

## Fetching User Data

### 1. Fetch User Profile Data

To get the profile data for a user, you can make a fetch request to:

```GET http://localhost:8080/api/user```

This will return a response like:

```json
{
    "id": 0,
    "email": "caitlyn87@example.com",
    "password": "",
    "firstName": "Erik",
    "lastName": "Mcintosh",
    "dateOfBirth": "1927-09-05T00:00:00Z",
    "avatarUrl": "https://placekitten.com/44/485",
    "nickname": "michael10",
    "aboutMe": "Defense read building effort interview charge. Decade century stand wife bad cost interesting. Generation even enjoy mother where two room.",
    "isPublic": true,
    "followers": 8,
    "followings": 10,
    // "total_post": 8 this will be add later just to be count
}
```
Alternatively, you can query a specific user by using their email:
```GET http://localhost:8080/api/user?target=user.email@example.org```
The email is typically available from the page URL using dynamic routing (e.g., [user_email]).

2. Fetch Posts by User
To get posts created by a specific user, you can fetch data by targeting the posts endpoint:

```GET http://localhost:8080/api/user?target=post```
If you want to fetch posts for another user, add the user query parameter:

```GET http://localhost:8080/api/user?target=post&user=user.email@example.org```
The response will be an array of posts like:

```json
[
    {
        "PostId": 1,
        "authorName": "first first",
        "postText": "sddfsdfsdf",
        "imagePostUrl": "",
        "postTime": "2025-03-09 11:31:49"
    }
]
```
Pass this data to the PostCard component to render the post on the front-end.

3. Fetch User's Followers & Following
To get the list of users that the current user is following or is followed by, use the following endpoints:

Following
```GET http://localhost:8080/api/user?target=following```
Followers
```GET http://localhost:8080/api/user?target=follower```
For another user, append the user query parameter:

```GET http://localhost:8080/api/user?target=following&user=first@gmail.com```
This will return a list of user objects like:

```json
[
    {
        "id": 0,
        "email": "caitlyn87@example.com",
        "password": "",
        "firstName": "Erik",
        "lastName": "Mcintosh",
        "dateOfBirth": "1927-09-05T00:00:00Z",
        "avatarUrl": "https://placekitten.com/44/485",
        "nickname": "michael10",
        "aboutMe": "Defense read building effort interview charge. Decade century stand wife bad cost interesting. Generation even enjoy mother where two room.",
        "isPublic": true,
        "followers": 8,
        "followings": 10
    }
]
```
### Notes
The field total_post will be added later, so it is not included in the responses for now.
When using dynamic routing, the user_email in the page URL will be used to fetch user data for the specific user.
Ensure that when making fetch requests, the correct query parameters are passed to get the desired information.