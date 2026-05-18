import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import '../styles/reports.css';
import '../styles/components.css';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState("summary");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, expensesRes, vehiclesRes] = await Promise.all([
        fetch("http://localhost:5000/api/sales"),
        fetch("http://localhost:5000/api/expenses"),
        fetch("http://localhost:5000/api/vehicles")
      ]);
      
      setSales(await salesRes.json());
      setExpenses(await expensesRes.json());
      setVehicles(await vehiclesRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date).toISOString().split('T')[0];
    return saleDate >= dateRange.start && saleDate <= dateRange.end;
  });

  const filteredExpenses = expenses.filter(expense => {
    return expense.date >= dateRange.start && expense.date <= dateRange.end;
  });

  // Calculations
  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(1) : 0;
  
  const salesByVehicle = {};
  filteredSales.forEach(sale => {
    const vehicleName = sale.vehicle_name || sale.vehicle;
    salesByVehicle[vehicleName] = (salesByVehicle[vehicleName] || 0) + Number(sale.amount);
  });

  const topVehicles = Object.entries(salesByVehicle)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const vehiclesByStatus = {
    available: vehicles.filter(v => v.status === 'available').length,
    sold: vehicles.filter(v => v.status === 'sold').length,
    pending: vehicles.filter(v => v.status === 'pending').length
  };

  const expensesByCategory = {};
  filteredExpenses.forEach(expense => {
    expensesByCategory[expense.description] = (expensesByCategory[expense.description] || 0) + Number(expense.amount);
  });

  const exportToCSV = () => {
    let csvData = [];
    let filename = "";
    
    if (reportType === "sales") {
      csvData = filteredSales.map(sale => ({
        ID: sale.id,
        Vehicle: sale.vehicle_name || sale.vehicle,
        Customer: sale.customer,
        Amount: sale.amount,
        Date: sale.sale_date
      }));
      filename = "sales_report.csv";
    } else if (reportType === "expenses") {
      csvData = filteredExpenses.map(expense => ({
        ID: expense.id,
        Description: expense.description,
        Amount: expense.amount,
        Date: expense.date
      }));
      filename = "expenses_report.csv";
    } else if (reportType === "vehicles") {
      csvData = vehicles.map(vehicle => ({
        ID: vehicle.id,
        Make: vehicle.make,
        Model: vehicle.model,
        Year: vehicle.year,
        Price: vehicle.selling_price || vehicle.price,
        VIN: vehicle.vin,
        Status: vehicle.status,
        Quantity: vehicle.quantity
      }));
      filename = "vehicles_inventory.csv";
    } else {
      csvData = [{
        "Total Revenue": totalRevenue,
        "Total Expenses": totalExpenses,
        "Net Profit": profit,
        "Profit Margin": `${profitMargin}%`,
        "Total Sales": filteredSales.length,
        "Total Vehicles": vehicles.length,
        "Available Vehicles": vehiclesByStatus.available,
        "Sold Vehicles": vehiclesByStatus.sold
      }];
      filename = "summary_report.csv";
    }
    
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const getStockClass = (quantity) => {
    if (quantity === 0) return 'stock-out';
    if (quantity <= 2) return 'stock-low';
    return 'stock-high';
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'available': return 'status-available';
      case 'sold': return 'status-sold';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="reports-wrapper">
      <Sidebar />
      
      <div className="reports-main">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h1 className="reports-title">Reports & Analytics</h1>
            <p className="reports-subtitle">View business insights and generate reports</p>
          </div>
          <div className="reports-button-group no-print">
            <button onClick={exportToCSV} className="btn btn-success">
              Export to CSV
            </button>
            <button onClick={printReport} className="btn btn-secondary">
              Print Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="reports-filters print-friendly">
          <div className="reports-filters-container">
            <div className="filter-group">
              <label className="filter-label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="filter-select"
              >
                <option value="summary">Summary Report</option>
                <option value="sales">Sales Report</option>
                <option value="expenses">Expenses Report</option>
                <option value="vehicles">Vehicles Inventory</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="filter-input"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading report data...</div>
        ) : (
          <>
            {/* Summary Report */}
            {reportType === "summary" && (
              <>
                {/* Key Metrics */}
                <div className="reports-stats-grid">
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
                    <p className="stat-card-title">Profit Margin</p>
                    <p className="stat-card-value text-primary">
                      {profitMargin}%
                    </p>
                  </div>
                </div>

                <div className="reports-two-column-grid">
                  {/* Top Selling Vehicles */}
                  <div className="report-card">
                    <h3 className="report-card-title">Top Selling Vehicles</h3>
                    {topVehicles.length === 0 ? (
                      <p className="text-muted">No sales data available</p>
                    ) : (
                      topVehicles.map(([vehicle, amount]) => (
                        <div key={vehicle} className="chart-item">
                          <div className="chart-label">
                            <span>{vehicle}</span>
                            <span className="fw-600">M{amount.toLocaleString()}</span>
                          </div>
                          <div className="chart-bar">
                            <div 
                              className="chart-bar-fill"
                              style={{ width: `${(amount / topVehicles[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Inventory Status */}
                  <div className="report-card">
                    <h3 className="report-card-title">Inventory Status</h3>
                    <div className="chart-item">
                      <div className="chart-label">
                        <span>Available</span>
                        <span>{vehiclesByStatus.available}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className="chart-bar-fill bg-success"
                          style={{ width: `${vehicles.length ? (vehiclesByStatus.available / vehicles.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="chart-item">
                      <div className="chart-label">
                        <span>Sold</span>
                        <span>{vehiclesByStatus.sold}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className="chart-bar-fill bg-danger"
                          style={{ width: `${vehicles.length ? (vehiclesByStatus.sold / vehicles.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="chart-item">
                      <div className="chart-label">
                        <span>Pending</span>
                        <span>{vehiclesByStatus.pending}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className="chart-bar-fill bg-warning"
                          style={{ width: `${vehicles.length ? (vehiclesByStatus.pending / vehicles.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  <div className="report-card">
                    <h3 className="report-card-title">Expense Breakdown</h3>
                    {Object.entries(expensesByCategory).length === 0 ? (
                      <p className="text-muted">No expense data available</p>
                    ) : (
                      Object.entries(expensesByCategory).map(([category, amount]) => (
                        <div key={category} className="list-item">
                          <span>{category}</span>
                          <span className="fw-600 text-danger">M{amount.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="report-card">
                    <h3 className="report-card-title">Quick Statistics</h3>
                    <div className="stat-item">
                      <span>Total Transactions</span>
                      <span className="fw-600">{filteredSales.length + filteredExpenses.length}</span>
                    </div>
                    <div className="stat-item">
                      <span>Average Sale Amount</span>
                      <span className="fw-600">
                        M{filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span>Average Expense</span>
                      <span className="fw-600">
                        M{filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(2) : 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span>Total Vehicles in Inventory</span>
                      <span className="fw-600">{vehicles.length}</span>
                    </div>
                    <div className="stat-item">
                      <span>Total Units in Stock</span>
                      <span className="fw-600">{vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Sales Report */}
            {reportType === "sales" && (
              <div className="reports-table-container">
                <div className="table-header">
                  <h3 className="table-title">Sales Report</h3>
                  <p className="table-subtitle">{dateRange.start} to {dateRange.end}</p>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Vehicle</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr key={sale.id}>
                          <td>{sale.id}</td>
                          <td>{sale.vehicle_name || sale.vehicle}</td>
                          <td>{sale.customer}</td>
                          <td className="fw-600 text-success">M{Number(sale.amount).toLocaleString()}</td>
                          <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-right fw-600">Total:</td>
                        <td className="fw-bold text-success">M{totalRevenue.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Expenses Report */}
            {reportType === "expenses" && (
              <div className="reports-table-container">
                <div className="table-header">
                  <h3 className="table-title">Expenses Report</h3>
                  <p className="table-subtitle">{dateRange.start} to {dateRange.end}</p>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{expense.id}</td>
                          <td>{expense.description}</td>
                          <td className="fw-600 text-danger">M{Number(expense.amount).toLocaleString()}</td>
                          <td>{expense.date}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="text-right fw-600">Total:</td>
                        <td className="fw-bold text-danger">M{totalExpenses.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Vehicles Inventory Report */}
            {reportType === "vehicles" && (
              <div className="reports-table-container">
                <div className="table-header">
                  <h3 className="table-title">Current Vehicle Inventory</h3>
                  <p className="table-subtitle">Total vehicles: {vehicles.length}</p>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Vehicle</th>
                        <th>Year</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td>{vehicle.id}</td>
                          <td>
                            <div className="fw-500">{vehicle.vehicle_name || `${vehicle.make} ${vehicle.model}`}</div>
                            <div className="small text-muted">{vehicle.make} {vehicle.model}</div>
                          </td>
                          <td>{vehicle.year}</td>
                          <td className="fw-600">M{Number(vehicle.selling_price || vehicle.price).toLocaleString()}</td>
                          <td>
                            <span className={`stock-badge ${getStockClass(vehicle.quantity || 1)}`}>
                              {vehicle.quantity || 1} {vehicle.quantity === 1 ? 'unit' : 'units'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                              {vehicle.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}