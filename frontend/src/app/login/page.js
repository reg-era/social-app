"use client"

import '../../style/login.css';
import { useState } from 'react';

export default function Login() {
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (e.target.email.value.length <= 0 || e.target.password.value.length <= 0) {
        setError('Invalid information. Please try again.');
        return
      }

      const res = await fetch('http://127.0.0.1:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
        })
      })

      if (res.ok) {
        const auth = res.headers.get('Authorization');
        document.cookie = `auth_session=${auth}; path=/;`;
        window.location.href = '/';
      } else {
        throw new Error('faild to singin');
      }
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" required
        />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" required
        />

        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
        <p>Don't have an account? <a href="/signup">Signup</a></p>
      </form>
    </div>
  );
}
