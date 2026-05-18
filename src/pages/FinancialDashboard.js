import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import '../styles/financial-dashboard.css';
import '../styles/components.css';

export default function FinancialDashboard() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
    
    // Listen for data update events from other components
    const handleDataUpdate = () => {
      console.log("Data update event received, refreshing...");
      fetchData();
    };
    
    window.addEventListener('data-updated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('data-updated', handleDataUpdate);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching data from API...");
      
      const [salesRes, expensesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/sales`),
        fetch(`${process.env.REACT_APP_API_URL}/api/expenses`)
      ]);
      
      const salesData = await salesRes.json();
      const expensesData = await expensesRes.json();
      
      console.log("Sales data loaded:", salesData.length);
      console.log("Expenses data loaded:", expensesData.length);
      
      setSales(Array.isArray(salesData) ? salesData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely parse dates
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  // Filter data by date range
  const filteredSales = sales.filter(sale => {
    if (!sale.sale_date) return false;
    const saleDate = parseDate(sale.sale_date);
    const startDate = parseDate(dateRange.start);
    const endDate = parseDate(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return saleDate >= startDate && saleDate <= endDate;
  });

  const filteredExpenses = expenses.filter(expense => {
    if (!expense.date) return false;
    const expenseDate = parseDate(expense.date);
    const startDate = parseDate(dateRange.start);
    const endDate = parseDate(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Monthly data for charts
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);
    const monthlyProfit = new Array(12).fill(0);

    filteredSales.forEach(sale => {
      const month = parseDate(sale.sale_date).getMonth();
      if (month >= 0 && month < 12) {
        monthlyRevenue[month] += Number(sale.amount) || 0;
      }
    });

    filteredExpenses.forEach(expense => {
      const month = parseDate(expense.date).getMonth();
      if (month >= 0 && month < 12) {
        monthlyExpenses[month] += Number(expense.amount) || 0;
      }
    });

    for (let i = 0; i < 12; i++) {
      monthlyProfit[i] = monthlyRevenue[i] - monthlyExpenses[i];
    }

    return { months, monthlyRevenue, monthlyExpenses, monthlyProfit };
  };

  const { months, monthlyRevenue, monthlyExpenses, monthlyProfit } = getMonthlyData();

  // Calculations - FIXED: Make sure all reduce functions have proper parameters
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) : 0;
  
  // Vehicle sales by make
  const salesByMake = {};
  filteredSales.forEach(sale => {
    const make = sale.make || sale.vehicle_name?.split(' ')[0] || 'Other';
    salesByMake[make] = (salesByMake[make] || 0) + (Number(sale.amount) || 0);
  });
  const topMakes = Object.entries(salesByMake).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Payment method breakdown - FIXED: Proper parameter names
  const paymentBreakdown = {
    Cash: filteredSales.filter(sale => sale.payment_method === 'Cash').reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0),
    Bank: filteredSales.filter(sale => sale.payment_method === 'Bank').reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0),
    Installment: filteredSales.filter(sale => sale.payment_method === 'Installment').reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0)
  };
  const paymentTotal = paymentBreakdown.Cash + paymentBreakdown.Bank + paymentBreakdown.Installment;

  // Sales by salesperson - FIXED: Proper parameter names
  const salesBySalesperson = {};
  filteredSales.forEach(sale => {
    const salesperson = sale.salesperson || 'Unassigned';
    salesBySalesperson[salesperson] = (salesBySalesperson[salesperson] || 0) + (Number(sale.amount) || 0);
  });
  const topSalespersons = Object.entries(salesBySalesperson).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Max values for charts
  const maxRevenue = Math.max(...monthlyRevenue, ...monthlyExpenses, 1000);
  const maxChartHeight = 150;

  if (loading && sales.length === 0 && expenses.length === 0) {
    return (
      <div className="financial-wrapper">
        <Sidebar />
        <div className="financial-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-wrapper">
      <Sidebar />
      
      <div className="financial-main">
        {/* Header with Refresh Button */}
        <div className="financial-header">
          <div>
            <h1 className="financial-title">Financial Dashboard</h1>
            <p className="financial-subtitle">
              Revenue analysis, cash flow tracking, and financial metrics
              {lastUpdated && (
                <span className="last-updated">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={fetchData} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? '⟳ Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Debug Info */}
        <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '15px', borderRadius: '5px', fontSize: '12px' }}>
          <strong>📊 Data Status:</strong> Sales: {sales.length} records | Expenses: {expenses.length} records | 
          Filtered Sales: {filteredSales.length} | Filtered Expenses: {filteredExpenses.length} |
          Total Revenue: M{totalRevenue.toLocaleString()} | Total Expenses: M{totalExpenses.toLocaleString()}
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <div className="date-range">
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                className="filter-input" 
              />
              <span>to</span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                className="filter-input" 
              />
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon revenue-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value">M{totalRevenue.toLocaleString()}</p>
              <p className="metric-change positive">+{profitMargin}% margin</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon expenses-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Total Expenses</p>
              <p className="metric-value">M{totalExpenses.toLocaleString()}</p>
              <p className="metric-change negative">{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}% of revenue</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon profit-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Net Profit</p>
              <p className="metric-value">M{netProfit.toLocaleString()}</p>
              <p className="metric-change positive">Profit Margin: {profitMargin}%</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon target-icon"></div>
            <div className="metric-info">
              <p className="metric-label">Transactions</p>
              <p className="metric-value">{filteredSales.length + filteredExpenses.length}</p>
              <p className="metric-change positive">{filteredSales.length} sales, {filteredExpenses.length} expenses</p>
            </div>
          </div>
        </div>

        {/* Revenue & Profit Trend Chart */}
        {(totalRevenue > 0 || totalExpenses > 0) ? (
          <>
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Revenue & Profit Trend</h3>
                <div className="chart-legend">
                  <span><span className="legend-dot revenue"></span> Revenue</span>
                  <span><span className="legend-dot expense"></span> Expenses</span>
                  <span><span className="legend-dot profit"></span> Profit</span>
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-y-axis">
                  <div className="y-label">Amount (M)</div>
                  {[maxRevenue, maxRevenue * 0.75, maxRevenue * 0.5, maxRevenue * 0.25, 0].map((val, i) => (
                    <div key={i} className="y-tick">M{Math.round(val).toLocaleString()}</div>
                  ))}
                </div>
                <div className="chart-area">
                  <div className="chart-bars">
                    {months.map((month, i) => (
                      <div key={i} className="bar-group">
                        <div 
                          className="bar revenue-bar" 
                          style={{ height: `${(monthlyRevenue[i] / maxRevenue) * maxChartHeight}px` }}
                          title={`Revenue: M${monthlyRevenue[i].toLocaleString()}`}
                        ></div>
                        <div 
                          className="bar expense-bar" 
                          style={{ height: `${(monthlyExpenses[i] / maxRevenue) * maxChartHeight}px` }}
                          title={`Expenses: M${monthlyExpenses[i].toLocaleString()}`}
                        ></div>
                        <div 
                          className="bar profit-bar" 
                          style={{ 
                            height: `${Math.abs(monthlyProfit[i] / maxRevenue) * maxChartHeight}px`, 
                            backgroundColor: monthlyProfit[i] >= 0 ? '#10b981' : '#ef4444' 
                          }}
                          title={`Profit: M${monthlyProfit[i].toLocaleString()}`}
                        ></div>
                        <div className="bar-label">{month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Analysis */}
            <div className="two-column-grid">
              {/* Revenue by Payment Method */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Revenue by Payment Method</h3>
                </div>
                <div className="payment-stats">
                  {Object.entries(paymentBreakdown).map(([method, amount]) => (
                    <div key={method} className="payment-item">
                      <div className="payment-info">
                        <span className="payment-name">{method}</span>
                        <span className="payment-percent">{paymentTotal > 0 ? ((amount / paymentTotal) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="payment-bar-container">
                        <div 
                          className="payment-bar" 
                          style={{ width: `${paymentTotal > 0 ? (amount / paymentTotal) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="payment-amount">M{amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Vehicle Make */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Revenue by Vehicle Make</h3>
                </div>
                <div className="make-list">
                  {topMakes.length > 0 ? topMakes.map(([make, amount]) => (
                    <div key={make} className="make-item">
                      <span className="make-name">{make}</span>
                      <div className="make-bar-container">
                        <div 
                          className="make-bar" 
                          style={{ width: `${(amount / topMakes[0][1]) * 100}%`, backgroundColor: '#0e48f1' }}
                        ></div>
                      </div>
                      <span className="make-amount">M{amount.toLocaleString()}</span>
                    </div>
                  )) : <div className="text-center" style={{ padding: '20px' }}>No vehicle sales data</div>}
                </div>
              </div>
            </div>

            {/* Sales by Salesperson */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Revenue by Salesperson</h3>
              </div>
              <div className="salesperson-table-container">
                <table className="salesperson-table">
                  <thead>
                    <tr>
                      <th>Salesperson</th>
                      <th>Revenue</th>
                      <th>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSalespersons.map(([name, amount]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td className="amount">M{amount.toLocaleString()}</td>
                        <td className="percent">{totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))}
                    {topSalespersons.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center">No sales data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Profit/Loss Table */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Monthly Profit/Loss Analysis</h3>
              </div>
              <div className="profit-table-container">
                <table className="profit-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Revenue</th>
                      <th>Expenses</th>
                      <th>Profit/Loss</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((month, i) => (
                      <tr key={month}>
                        <td className="month">{month}</td>
                        <td className="revenue">M{monthlyRevenue[i].toLocaleString()}</td>
                        <td className="expense">M{monthlyExpenses[i].toLocaleString()}</td>
                        <td className={monthlyProfit[i] >= 0 ? 'profit' : 'loss'}>
                          M{monthlyProfit[i].toLocaleString()}
                        </td>
                        <td className={monthlyRevenue[i] > 0 && (monthlyProfit[i] / monthlyRevenue[i] * 100) >= 0 ? 'profit' : 'loss'}>
                          {monthlyRevenue[i] > 0 ? ((monthlyProfit[i] / monthlyRevenue[i]) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="total-label">Total</td>
                      <td className="total-revenue">M{totalRevenue.toLocaleString()}</td>
                      <td className="total-expense">M{totalExpenses.toLocaleString()}</td>
                      <td className="total-profit">M{netProfit.toLocaleString()}</td>
                      <td className="total-margin">{profitMargin}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="chart-card">
            <div className="empty-state" style={{ padding: '50px', textAlign: 'center' }}>
              <p>No data available for the selected date range.</p>
              <p className="small">Try adjusting your date range or add some sales/expenses data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}