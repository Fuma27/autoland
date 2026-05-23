import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiUser } from "react-icons/fi";
import '../styles/sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const menuItems = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/vehicles", name: "Vehicles" },
    { path: "/sales", name: "Sales" },
    { path: "/expenses", name: "Expenses" },
    { path: "/employees", name: "Employees" },
    { path: "/financial", name: "Financial", icon: "📊" },
    { path: "/reports", name: "Reports", icon: "📈" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/autoland-logo.png" alt="Autoland Logo" style={{ height: '32px', objectFit: 'contain' }} />
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
              <span>AUTO</span>
              <span>LAND</span>
            </h1>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>×</button>
        </div>
        <p className="sidebar-subtitle">Car Dealership Management</p>
        
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
            </div>
            <div className="sidebar-user-details">
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-email">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer border-t border-gray-800/40 pt-4 flex flex-col gap-2">
        {user && (
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        )}
        <div className="text-[11px] text-gray-500 flex justify-between px-1">
          <span>© {new Date().getFullYear()} AutoLand</span>
          <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
}