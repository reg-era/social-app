import './signup.css';

export default function Signup() {
  return (
    <div className="signup-container">
      <h1>Signup</h1>
      <form className="signup-form" action="/home" method="POST">
      <label htmlFor="nickname">Nickname (Optional)</label>
        <input
          type="text"
          name="nickname"
          id="nickname"
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          required
        />
        <label htmlFor="First Name">First Name</label>
        <input
          type="text"
          name="First Name"
          id="firstname"
          required
        />
        <label htmlFor="Last Name">Last Name</label>
        <input
          type="text"
          name="Last Name"
          id="lastname"
          required
        />
        <label htmlFor="Date of birth">Date of Birth</label>
        <input
          type="date"
          name=""
          id="lastname"
          required
        />
        <label htmlFor="avatar">Avatar/Image (Optional)</label>
        <input
          type="file"
          name="avatar"
          id="avatar"
        />
        <label htmlFor="aboutme">About Me (Optional)</label>
        <textarea
          name="aboutme"
          id="aboutme"
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          required
        />
        <button type="submit">Signup</button>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}