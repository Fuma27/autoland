import { Link, useLocation } from "react-router-dom";
import '../styles/sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: "/", name: "Dashboard" },
    { path: "/vehicles", name: "Vehicles" },
    { path: "/sales", name: "Sales" },
    { path: "/expenses", name: "Expenses" },
    { path: "/employees", name: "Employees" },
    { path: "/financial", name: "Financial", icon: "📊" },
    { path: "/reports", name: "Reports", icon: "📈" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          <span>AUTO</span>
          <span>LAND</span>
        </h1>
        <p className="sidebar-subtitle">Car Dealership Management</p>
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

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">© 2024 AutoLand</p>
        <p className="sidebar-footer-text">Version 1.0</p>
      </div>
    </aside>
  );
}