import React, { useState } from "react";
import { signUpWithEmail, signInWithGoogle } from "../../auth/authService";
import "../../styles/Auth.css";

const Register = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    try {
      await signUpWithEmail(email, password);
      onClose(); // Close the modal on successful registration
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
      <h2 className="auth-title">Create an Account</h2>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="form-control"
            placeholder="At least 6 characters"
          />
        </div>
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <div className="auth-divider">
        <span>OR</span>
      </div>
      <button onClick={handleGoogleSignIn} disabled={loading} className="google-btn">
        Sign Up with Google
      </button>
    </div>
  );
};

export default Register;