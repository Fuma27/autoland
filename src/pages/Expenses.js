import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import '../styles/expenses.css';
import '../styles/components.css';
import '../styles/sidebar.css';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses`);
      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []);
      
      // Calculate summary
      const totalExpenses = data.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyExpenses = data.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      }).reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      setSummary({
        total: totalExpenses,
        count: data.length,
        monthly: monthlyExpenses,
        average: data.length > 0 ? totalExpenses / data.length : 0
      });
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add expense");
      }
      
      setSuccess("Expense added successfully!");
      setNewExpense({ description: "", amount: "", date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      fetchExpenses();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }
      
      setSuccess("Expense deleted successfully!");
      fetchExpenses();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="expenses-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="expenses-main">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="mobile-logo"><span>AUTO</span><span>LAND</span></div>
          <div style={{ width: 40 }} />
        </div>
        {/* Header */}
        <div className="expenses-header">
          <div>
            <h1 className="expenses-title">Expenses Management</h1>
            <p className="expenses-subtitle">Track and manage all business expenses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "+ Add Expense"}
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="expenses-stats-grid">
            <div className="stat-card">
              <p className="stat-card-title">Total Expenses</p>
              <p className="stat-card-value text-danger">
                M{summary.total.toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">This Month</p>
              <p className="stat-card-value text-warning">
                M{summary.monthly.toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Number of Expenses</p>
              <p className="stat-card-value">{summary.count}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Average Expense</p>
              <p className="stat-card-value">
                M{summary.average.toLocaleString()}
              </p>
              <p className="stat-card-subtext">per transaction</p>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {success && <div className="alert alert-success">✓ {success}</div>}
        {error && <div className="alert alert-error">✗ {error}</div>}

        {/* Expense Form */}
        {showForm && (
          <div className="expense-form-card">
            <div className="form-card-header">
              <h3 className="form-card-title">Add New Expense</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-group">
                <label className="form-label required">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Office Rent, Utilities, Marketing"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label required">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label required">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Expense"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses Table */}
        <div className="expenses-table-container">
          <div className="table-header">
            <h3 className="table-title">Expense History</h3>
            <p className="table-subtitle">View and manage all recorded expenses</p>
          </div>
          
          {loading && !expenses.length ? (
            <div className="loading-state">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses recorded yet.</p>
              <p className="small mt-2">Click "Add Expense" to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.id}</td>
                      <td>
                        <div className="fw-500">{expense.description}</div>
                      </td>
                      <td className="amount-negative">
                        M{Number(expense.amount).toLocaleString()}
                      </td>
                      <td>
                        {new Date(expense.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="btn-delete-expense"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="text-right fw-600">Total:</td>
                    <td className="fw-bold amount-negative">
                      M{expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString()}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}