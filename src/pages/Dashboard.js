import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/components.css";
import "../styles/sidebar.css";

function Dashboard() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, expensesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/sales`),
        fetch(`${process.env.REACT_APP_API_URL}/api/expenses`)
      ]);
      setSales(await salesRes.json());
      setExpenses(await expensesRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="dashboard-main">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="mobile-logo"><span>AUTO</span><span>LAND</span></div>
          <div style={{ width: 40 }} />
        </div>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome to AutoLand Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <p className="stat-card-title">Total Revenue</p>
            <p className="stat-card-value text-success">
              M{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">Total Expenses</p>
            <p className="stat-card-value text-danger">
              M{totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">Net Profit</p>
            <p className={`stat-card-value ${profit >= 0 ? 'text-primary' : 'text-danger'}`}>
              M{profit.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">Total Sales</p>
            <p className="stat-card-value">{sales.length}</p>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="dashboard-table-card">
          <div className="table-header">
            <h3 className="table-title">Recent Sales</h3>
            <p className="table-subtitle">Latest 5 transactions</p>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">Loading...</td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No sales recorded</td>
                  </tr>
                ) : (
                  sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.vehicle_name || sale.vehicle}</td>
                      <td>{sale.customer}</td>
                      <td className="fw-600">M{Number(sale.amount).toLocaleString()}</td>
                      <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;