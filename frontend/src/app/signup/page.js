"use client"

import '../../style/signup.css';
import { useState } from 'react';

export default function Signup() {
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("email", e.target.email.value);
      formData.append("password", e.target.password.value);
      formData.append("firstName", e.target.firstName.value);
      formData.append("lastName", e.target.lastName.value);
      formData.append("dateOfBirth", e.target.date.value);
      formData.append("avatar", e.target.avatar.files[0]);
      formData.append("nickname", e.target.nickname.value);
      formData.append("aboutMe", e.target.aboutme.value);

      // if (!checkDataValidation(data)) {
      // setError('Invalid form. Please try again.');
      // return;
      // }

      const res = await fetch('http://127.0.0.1:8080/api/signin', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        window.location.href = '/login';
      } else {
        throw new Error('faild to singup');
      }

    } catch (error) {
      setError('Failed to submit the form. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <h1>Signup</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label htmlFor="firstName">First Name</label>
        <input type="text" name="firstName" id="firstname" required />

        <label htmlFor="lastName">Last Name</label>
        <input type="text" name="lastName" id="lastname" required />
        
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" required />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" required />

        <label htmlFor="nickname">Nickname (Optional)</label>
        <input type="text" name="nickname" id="nickname" />

        <label htmlFor="date">Date of Birth</label>
        <input type="date" name="date" id="date" required />

        <label htmlFor="avatar">Avatar/Image (Optional)</label>
        <input type="file" name="avatar" id="avatar" />

        <label htmlFor="aboutme">About Me (Optional)</label>
        <textarea name="aboutme" id="aboutme" />

        {error && <p className="error-message">{error}</p>}
        <button type="submit">Signup</button>
        <p>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
}

function checkDataValidation(data) {
  // if (!data.password.length <= 0 || !data.firstName.length <= 0 || !data.lastName.length <= 0 || (data.aboutMe && data.aboutMe.length > 100)) {
  // return false;
  // }
  // 
  // const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  // if (!emailRegex.test(data.email)) {
  // return false;
  // }
  // 
  // 
  // if (isNaN(new Date(data.dateOfBirth))) {
  // return false;
  // }

  // if (data.avatarUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(data.avatarUrl)) {
  // return false;
  // }

  return true;
}