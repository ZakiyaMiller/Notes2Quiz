import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "../../styles/Auth.css";

const AuthModal = ({ onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLoginView(false);
  };

  const handleSwitchToLogin = () => {
    setIsLoginView(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button> 
        {isLoginView ? (
          <div>
            <Login onClose={onClose} />
            <p className="auth-switch-text">
              Don't have an account?{" "}
              <button onClick={handleSwitchToRegister} className="auth-switch-btn">
                Sign Up
              </button>
            </p>
          </div>
        ) : (
          <div>
            <Register onClose={onClose} />
            <p className="auth-switch-text">
              Already have an account?{" "}
              <button onClick={handleSwitchToLogin} className="auth--switch-btn">
                Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;