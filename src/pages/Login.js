import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";
import "../styles/auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, setError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setError(null);

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    setLocalLoading(true);
    const result = await login(email, password);
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
            <img src="/autoland-logo.png" alt="Autoland Logo" style={{ height: '48px', objectFit: 'contain' }} />
            <div>
              <span className="brand-auto">AUTO</span>
              <span className="brand-land">LAND</span>
            </div>
          </div>
          <p>Sign in to your dealership dashboard</p>
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
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FiMail size={16} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

