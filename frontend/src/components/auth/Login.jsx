import React, { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "../../auth/authService";
import "../../styles/Auth.css";

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose(); // Close the modal on successful login
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose(); // Close the modal on successful sign-in
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-title">Welcome Back</h2>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control"
            placeholder="Your password"
          />
        </div>
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>
      <div className="auth-divider">
        <span>OR</span>
      </div>
      <button onClick={handleGoogleSignIn} disabled={loading} className="google-btn">
        Sign In with Google
      </button>
    </div>
  );
};

export default Login;