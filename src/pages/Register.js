import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, error, setError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    setLocalLoading(true);
    const result = await register(name, email, password);
    setLocalLoading(false);

    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="auth-back-link"
      >
        <FiArrowLeft /> Back to Home
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <img src="/autoland-logo.jpg" alt="Autoland Logo" style={{ height: '48px', objectFit: 'contain' }} />
            <div>
              <span className="brand-auto">AUTO</span>
              <span className="brand-land">LAND</span>
            </div>
          </div>
          <p>Create an admin account to manage your system</p>
        </div>

        {/* Error Message */}
        {(localError || error) && (
          <div className="auth-error">
            <FiAlertTriangle className="mt-0.5 flex-shrink-0" size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              Full Name
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FiUser size={16} />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FiMail size={16} />
              </span>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FiLock size={16} />
              </span>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FiLock size={16} />
              </span>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={localLoading}
            className="btn-submit"
          >
            {localLoading ? (
              <span className="spinner"></span>
            ) : (
              "Register Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

