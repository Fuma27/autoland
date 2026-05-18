import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Vehicles from "./pages/Vehicles";
import Expenses from "./pages/Expenses";
import Employees from "./pages/Employees";
import FinancialDashboard from "./pages/FinancialDashboard";
import Reports from "./pages/Reports";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <span>AUTO</span>
          <span>LAND</span>
        </div>
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/financial" element={<FinancialDashboard />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;