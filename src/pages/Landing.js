import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiArrowRight, FiCheckCircle, FiTrendingUp, FiDollarSign, FiUsers } from "react-icons/fi";
import "../styles/landing.css";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <span className="brand-auto">AUTO</span>
          <span className="brand-land">LAND</span>
        </div>
        <div className="landing-nav">
          {user ? (
            <Link
              to="/dashboard"
              className="btn-primary"
            >
              Go to Dashboard <FiArrowRight />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-link"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>Dealership Management Redefined</span>
          </div>
          <h1 className="hero-title">
            Accelerate Your <br />
            <span className="hero-title-gradient">
              Dealership Sales
            </span>
          </h1>
          <p className="hero-subtitle">
            Streamline your inventory, simplify sales tracking, analyze financial reporting, and manage your employees all in one elegant, unified platform.
          </p>

          <div className="hero-actions">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary btn-primary-large"
              >
                Open System <FiArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary btn-primary-large"
                >
                  Start Managing Now <FiArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="btn-outline"
                >
                  Access Console
                </Link>
              </>
            )}
          </div>

          {/* Micro Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <p className="stat-value">100%</p>
              <p className="stat-label">Cloud Hosted</p>
            </div>
            <div className="stat-item">
              <p className="stat-value">Secured</p>
              <p className="stat-label">JWT Encrypted</p>
            </div>
            <div className="stat-item">
              <p className="stat-value">Realtime</p>
              <p className="stat-label">Analytics</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (Right column) */}
        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-blue">
              <FiCheckCircle size={22} />
            </div>
            <h3>Inventory Control</h3>
            <p>
              Keep dynamic tabs on your fleet: status, pricing, purchase info, and detailed specifications.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper icon-indigo">
              <FiTrendingUp size={22} />
            </div>
            <h3>Sales Analytics</h3>
            <p>
              Track custom transactions, manage customer registries, and observe monthly profit margins.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper icon-emerald">
              <FiDollarSign size={22} />
            </div>
            <h3>Expense Tracking</h3>
            <p>
              Log utilities, salaries, and other operational overheads to monitor your net dealership health.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper icon-purple">
              <FiUsers size={22} />
            </div>
            <h3>Employee Records</h3>
            <p>
              Manage your staff, assign commissions, and store critical contact details securely.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} AutoLand. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

