import './login.css';

export default function Login() {
  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" action="/Home" method="POST">
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" required />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" required />

        <button type="submit">Login</button>
        <p>  Don't have an account? <a href="/signup">Signup</a></p>
      </form>
    </div>
  );
}