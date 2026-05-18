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
  return (
    <div className="app-layout">
      <Sidebar />
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