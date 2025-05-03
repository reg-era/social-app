"use client"

import '../../style/signup.css';
import { useState } from 'react';

export default function Signup() {
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData();
      const birthdate = e.target.date.value;

      formData.append("email", e.target.email.value);
      formData.append("password", e.target.password.value);
      formData.append("firstName", e.target.firstName.value);
      formData.append("lastName", e.target.lastName.value);
      formData.append("dateOfBirth", birthdate);
      formData.append("avatar", e.target.avatar.files[0]);
      formData.append("nickname", e.target.nickname.value);
      formData.append("aboutMe", e.target.aboutme.value);

      const err = checkDataValidation(formData);
      if (err != null) {
        throw new Error(err);
      }

      const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/signin`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        window.location.href = '/login';
      } else {
        const resulErr = await res.json()         
        throw new Error(resulErr.error);
      }

    } catch (error) {
      setError(error.toString());
    }
  };


  return (
    <div className="signup-container">
      <h1>Signup</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label htmlFor="firstName">First Name</label>
        <input type="text" name="firstName" id="firstname" /*required*/ />

        <label htmlFor="lastName">Last Name</label>
        <input type="text" name="lastName" id="lastname" /*required*/ />

        <label htmlFor="email">Email</label>
        <input /*type="email"*/ name="email" id="email" /*required*/ />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" /*required*/ />

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

function isAtLeast18(birthdateStr) {
  const birthdate = new Date(birthdateStr);
  const today = new Date();

  if (isNaN(birthdate.getTime())) {
    throw new Error("Invalid date format");
  }

  let age = today.getFullYear() - birthdate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthdate.getMonth() ||
    (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age >= 18;
}

function checkDataValidation(data) {
  if ((data.has('password') && data.get('password').length <= 0) || (data.has('firstName') && data.get('firstName').length <= 0) || (data.has('lastName') && data.get('lastName').length <= 0)) {
    return 'user information is not match the wiwwiwiwi';
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (data.has('email') && !emailRegex.test(data.get('email'))) {
    return 'is not a valid email';
  }

  if (data.has('dateOfBirth') && !isAtLeast18(data.get('dateOfBirth'))) {
    return 'You must be at least 18 years old to sign up.';
  }

  return null;
}