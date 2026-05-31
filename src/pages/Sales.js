import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import CustomerForm from "../components/CustomerForm";
import VehicleSearch from "../components/VehicleSearch";
import { FiTruck, FiUser, FiDollarSign } from "react-icons/fi";
import '../styles/sales.css';
import '../styles/components.css';
import '../styles/sidebar.css';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [newSale, setNewSale] = useState({
    vehicle_id: "",
    customer_id: "",
    customer_name: "",
    quantity_sold: 1,
    payment_method: "Cash",
    amount_paid: "",
    installment_months: "",
    first_name: "",
    last_name: "",
    id_number: "",
    email: "",
    phone: "",
    alternative_phone: "",
    address: "",
    city: ""
  });

  useEffect(() => {
    fetchSales();
    fetchAvailableVehicles();
    fetchCustomers();
    fetchSummary();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales`);
      const data = await response.json();
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles/available`);
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/customers`);
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales/summary/analytics`);
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const searchCustomers = async (query) => {
    if (query.length < 2) {
      setCustomerSearchResults([]);
      setShowCustomerResults(false);
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/customers/search/${query}`);
      const data = await response.json();
      setCustomerSearchResults(data);
      setShowCustomerResults(true);
    } catch (err) {
      console.error("Error searching customers:", err);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNewSale({
      ...newSale,
      customer_id: customer.id,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      first_name: customer.first_name,
      last_name: customer.last_name,
      id_number: customer.id_number,
      email: customer.email || "",
      phone: customer.phone,
      alternative_phone: customer.alternative_phone || "",
      address: customer.address || "",
      city: customer.city || ""
    });
    setShowCustomerResults(false);
    setSearchCustomerTerm("");
  };

  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewSale({
      ...newSale,
      vehicle_id: vehicle.id,
      quantity_sold: 1
    });
    setShowForm(true);
  };

  const getSelectedVehicleDetails = () => {
    return selectedVehicle || vehicles.find(v => v.id === parseInt(newSale.vehicle_id));
  };

  const maxQuantity = getSelectedVehicleDetails()?.quantity || 0;
  const selectedVehicleDetails = getSelectedVehicleDetails();
  const totalAmount = selectedVehicleDetails ? selectedVehicleDetails.price * newSale.quantity_sold : 0;
  const balanceDue = totalAmount - (parseFloat(newSale.amount_paid) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSale)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Sale failed");
      }
      
      setSuccess(`Sale completed successfully! ${data.payment_status === 'Paid' ? 'Full payment received.' : `Balance due: M${data.balance_due.toLocaleString()}`}`);
      resetForm();
      fetchSales();
      fetchAvailableVehicles();
      fetchCustomers();
      fetchSummary();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales/${selectedSale.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_paid: parseFloat(paymentAmount) })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }
      
      setSuccess(`Payment recorded! Balance due: M${data.balance_due.toLocaleString()}`);
      setShowPaymentModal(false);
      setPaymentAmount("");
      fetchSales();
      fetchSummary();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const resetForm = () => {
    setNewSale({
      vehicle_id: "",
      customer_id: "",
      customer_name: "",
      quantity_sold: 1,
      payment_method: "Cash",
      amount_paid: "",
      installment_months: "",
      first_name: "",
      last_name: "",
      id_number: "",
      email: "",
      phone: "",
      alternative_phone: "",
      address: "",
      city: ""
    });
    setSelectedVehicle(null);
    setSelectedCustomer(null);
    setShowForm(false);
    setShowCustomerForm(false);
  };

  const handleDownloadInvoice = (sale) => {
    const balance = sale.amount - sale.amount_paid;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - #${sale.id}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #333;
              padding: 40px;
              line-height: 1.6;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-section img {
              height: 50px;
              object-fit: contain;
            }
            .logo-section h2 {
              margin: 5px 0 0 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: 1px;
            }
            .logo-section h2 span:first-child {
              color: #000;
            }
            .logo-section h2 span:last-child {
              color: #0e48f1;
            }
            .company-info {
              text-align: right;
              font-size: 14px;
            }
            .invoice-title-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: bold;
              text-transform: uppercase;
              color: #111;
            }
            .invoice-meta {
              font-size: 14px;
              text-align: right;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 15px;
              color: #555;
            }
            .details p {
              margin: 4px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 13px;
            }
            .text-right {
              text-align: right;
            }
            .totals-section {
              width: 300px;
              margin-left: auto;
              margin-bottom: 40px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .totals-row.grand-total {
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              font-weight: bold;
              font-size: 18px;
              padding: 12px 0;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              border-top: 1px solid #eee;
              padding-top: 20px;
              margin-top: 50px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="logo-section">
              <img src="/autoland-logo.png" alt="AutoLand Logo" onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='block';" />
              <div id="logo-fallback" style="display:none; font-size: 24px; font-weight: 800;"><span style="color:#000;">AUTO</span><span style="color:#0e48f1;">LAND</span></div>
            </div>
            <div class="company-info">
              <strong>AutoLand Dealership</strong><br />
              123 Main Road, Showroom District<br />
              Maseru, Lesotho<br />
              Phone: +266 2231 1234<br />
              Email: billing@autoland.co.ls
            </div>
          </div>

          <div class="invoice-title-section">
            <div>
              <span class="invoice-title">Sales Invoice</span>
            </div>
            <div class="invoice-meta">
              <strong>Invoice #:</strong> INV-${sale.id.toString().padStart(6, '0')}<br />
              <strong>Date:</strong> ${new Date(sale.sale_date).toLocaleDateString()}<br />
              <strong>Payment Method:</strong> ${sale.payment_method}<br />
              <strong>Status:</strong> ${sale.payment_status}
            </div>
          </div>

          <div class="grid">
            <div class="details">
              <div class="section-title">Bill To</div>
              <p><strong>Customer Name:</strong> ${sale.first_name} ${sale.last_name}</p>
              <p><strong>National ID:</strong> ${sale.id_number || 'N/A'}</p>
              <p><strong>Phone:</strong> ${sale.phone || 'N/A'}</p>
              <p><strong>Email:</strong> ${sale.email || 'N/A'}</p>
              <p><strong>Address:</strong> ${sale.address || ''}, ${sale.city || ''}</p>
            </div>
            <div class="details">
              <div class="section-title">Seller Info</div>
              <p><strong>Representative:</strong> ${sale.salesperson || 'AutoLand Sales Team'}</p>
              <p><strong>Store Location:</strong> Main Showroom</p>
              <p><strong>Warranty:</strong> 12 Months Limited Dealer Warranty</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Vehicle Description</th>
                <th>Make & Model</th>
                <th>Registration</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${sale.vehicle_name}</strong></td>
                <td>${sale.make} ${sale.model}</td>
                <td>${sale.registration_number || 'N/A'}</td>
                <td class="text-right">${sale.quantity_sold}</td>
                <td class="text-right">M${Number(sale.amount / sale.quantity_sold).toLocaleString()}</td>
                <td class="text-right">M${Number(sale.amount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>M${Number(sale.amount).toLocaleString()}</span>
            </div>
            <div class="totals-row">
              <span>Amount Paid:</span>
              <span style="color: green; font-weight: 500;">M${Number(sale.amount_paid).toLocaleString()}</span>
            </div>
            <div class="totals-row" style="border-top: 1px dashed #ddd; padding-top: 8px;">
              <span>Balance Due:</span>
              <span style="color: ${balance > 0 ? 'red' : 'inherit'}; font-weight: 500;">
                M${balance > 0 ? balance.toLocaleString() : '0.00'}
              </span>
            </div>
            <div class="totals-row grand-total">
              <span>Grand Total:</span>
              <span>M${Number(sale.amount).toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div style="width: 200px; border-top: 1px solid #333; text-align: center; padding-top: 5px; font-size: 13px;">
              Customer Signature
            </div>
            <div style="width: 200px; border-top: 1px solid #333; text-align: center; padding-top: 5px; font-size: 13px;">
              Authorized Signature
            </div>
          </div>

          <div class="footer">
            Thank you for your business! AutoLand is registered in Lesotho. Terms & conditions apply.
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'badge-success';
      case 'Partial': return 'badge-warning';
      case 'Pending': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="sales-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="sales-main">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="mobile-logo"><span>AUTO</span><span>LAND</span></div>
          <div style={{ width: 40 }} />
        </div>
        {/* Header */}
        <div className="d-flex justify-between align-center mb-4">
          <div>
            <h1 className="page-title">Sales Management</h1>
            <p className="page-subtitle">Record sales, manage customers, and track payments</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setSelectedVehicle(null);
              setSelectedCustomer(null);
            }}
            className="btn btn-primary"
          >
            <span>+</span>
            {showForm ? "Cancel" : "New Sale"}
          </button>
        </div>

        {/* Vehicle Search Section */}
        <div className="mb-4">
          <VehicleSearch 
            onSelectVehicle={selectVehicle}
            onEditVehicle={(vehicle) => {
              console.log("Edit vehicle:", vehicle);
            }}
            onViewDetails={(vehicle) => {
              console.log("View details:", vehicle);
            }}
          />
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="sales-stats-grid mb-4">
            <div className="stat-card">
              <p className="stat-card-title">Total Revenue</p>
              <p className="stat-card-value text-success">
                M{summary.total_revenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Total Received</p>
              <p className="stat-card-value text-primary">
                M{summary.total_received?.toLocaleString() || 0}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Outstanding Balance</p>
              <p className="stat-card-value text-warning">
                M{summary.total_outstanding?.toLocaleString() || 0}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Total Sales</p>
              <p className="stat-card-value">{summary.total_sales || 0}</p>
              <p className="stat-card-subtext">
                {summary.cash_sales || 0} Cash | {summary.bank_sales || 0} Bank | {summary.installment_sales || 0} Installment
              </p>
              <p className="stat-card-subtext">
                {summary.unique_customers || 0} Unique Customers
              </p>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {success && <div className="alert alert-success">✓ {success}</div>}
        {error && <div className="alert alert-error">✗ {error}</div>}

        {/* Sales Form */}
        {showForm && (
          <div className="card mb-4">
            <div className="card-header bg-primary">
              <h3 className="card-title text-white">New Sale</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="card-body">
              {/* Vehicle Selection */}
              <div className="form-section">
                <h4 className="form-section-title"><FiTruck size={15} /> Vehicle Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Select Vehicle</label>
                    <select
                      value={newSale.vehicle_id}
                      onChange={(e) => {
                        setNewSale({...newSale, vehicle_id: e.target.value, quantity_sold: 1});
                        setSelectedVehicle(vehicles.find(v => v.id === parseInt(e.target.value)));
                      }}
                      className="form-select"
                      required
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_name || `${vehicle.make} ${vehicle.model}`} - M{vehicle.price.toLocaleString()} (Stock: {vehicle.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label required">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={maxQuantity}
                      value={newSale.quantity_sold}
                      onChange={(e) => setNewSale({...newSale, quantity_sold: parseInt(e.target.value)})}
                      className="form-input"
                      required
                    />
                    {newSale.vehicle_id && (
                      <p className="form-help">
                        Available stock: {maxQuantity} units
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Selection */}
              <div className="form-section">
                <h4 className="form-section-title"><FiUser size={15} /> Customer Information</h4>
                
                {/* Search Existing Customer */}
                <div className="form-group">
                  <label className="form-label">Search Existing Customer</label>
                  <div className="customer-search-container">
                    <input
                      type="text"
                      placeholder="Search by name, ID number, or phone..."
                      value={searchCustomerTerm}
                      onChange={(e) => {
                        setSearchCustomerTerm(e.target.value);
                        searchCustomers(e.target.value);
                      }}
                      className="form-input"
                    />
                    {showCustomerResults && customerSearchResults.length > 0 && (
                      <div className="customer-search-dropdown">
                        {customerSearchResults.map(customer => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="customer-search-item"
                          >
                            <div className="fw-600">{customer.first_name} {customer.last_name}</div>
                            <div className="text-muted small">
                              ID: {customer.id_number} | Phone: {customer.phone}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm mt-2"
                    onClick={() => setShowCustomerForm(true)}
                  >
                    + Add New Customer
                  </button>
                </div>

                {/* Selected Customer Info */}
                {selectedCustomer && (
                  <div className="selected-customer-info">
                    <strong>Selected Customer:</strong><br />
                    {selectedCustomer.first_name} {selectedCustomer.last_name}<br />
                    <small>
                      ID: {selectedCustomer.id_number} | Phone: {selectedCustomer.phone}
                      {selectedCustomer.email && ` | Email: ${selectedCustomer.email}`}
                    </small>
                  </div>
                )}

                {/* Or fill new customer details */}
                {!selectedCustomer && !showCustomerForm && (
                  <div className="mt-3">
                    <p className="text-muted mb-2">OR fill in new customer details:</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          value={newSale.first_name}
                          onChange={(e) => setNewSale({...newSale, first_name: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          value={newSale.last_name}
                          onChange={(e) => setNewSale({...newSale, last_name: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">ID Number *</label>
                        <input
                          type="text"
                          value={newSale.id_number}
                          onChange={(e) => setNewSale({...newSale, id_number: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          value={newSale.phone}
                          onChange={(e) => setNewSale({...newSale, phone: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          value={newSale.email}
                          onChange={(e) => setNewSale({...newSale, email: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Alternative Phone</label>
                        <input
                          type="tel"
                          value={newSale.alternative_phone}
                          onChange={(e) => setNewSale({...newSale, alternative_phone: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                          type="text"
                          value={newSale.address}
                          onChange={(e) => setNewSale({...newSale, address: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          value={newSale.city}
                          onChange={(e) => setNewSale({...newSale, city: e.target.value})}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="form-section">
                <h4 className="form-section-title"><FiDollarSign size={15} /> Payment Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Payment Method</label>
                    <select
                      value={newSale.payment_method}
                      onChange={(e) => setNewSale({...newSale, payment_method: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank">Bank Transfer</option>
                      <option value="Installment">Installment</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label required">Amount Paid</label>
                    <input
                      type="number"
                      min="0"
                      max={totalAmount}
                      placeholder="Amount paid"
                      value={newSale.amount_paid}
                      onChange={(e) => setNewSale({...newSale, amount_paid: parseFloat(e.target.value)})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  {newSale.payment_method === 'Installment' && newSale.amount_paid < totalAmount && (
                    <div className="form-group">
                      <label className="form-label">Installment Period (Months)</label>
                      <select
                        value={newSale.installment_months}
                        onChange={(e) => setNewSale({...newSale, installment_months: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select months</option>
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {selectedVehicleDetails && (
                  <div className="payment-summary mt-3">
                    <h4 className="fw-600 mb-2">Payment Summary</h4>
                    <div className="summary-grid">
                      <div className="summary-box">
                        <p className="text-muted small">Total Amount</p>
                        <p className="fw-bold fs-4">M{totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="summary-box">
                        <p className="text-muted small">Amount Paid</p>
                        <p className="fw-bold fs-4 text-success">M{(parseFloat(newSale.amount_paid) || 0).toLocaleString()}</p>
                      </div>
                      <div className="summary-box">
                        <p className="text-muted small">Balance Due</p>
                        <p className={`fw-bold fs-4 ${balanceDue > 0 ? 'text-danger' : 'text-success'}`}>
                          M{balanceDue > 0 ? balanceDue.toLocaleString() : '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-success btn-block mt-3"
                disabled={loading || !newSale.vehicle_id || (!selectedCustomer && (!newSale.first_name || !newSale.last_name || !newSale.phone))}
              >
                {loading ? "Processing..." : "Complete Sale"}
              </button>
            </form>
          </div>
        )}

        {/* Sales History Table */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Sales History</h3>
            <p className="table-subtitle">View all sales with complete customer details</p>
          </div>
          
          {loading && !sales.length ? (
            <div className="loading-state">Loading...</div>
          ) : sales.length === 0 ? (
            <div className="empty-state">No sales recorded yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>ID Number</th>
                  <th>Contact</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const balance = sale.amount - sale.amount_paid;
                  
                  return (
                    <tr key={sale.id}>
                      <td className="font-mono">#{sale.id}</td>
                      <td>
                        <div className="fw-500">{sale.vehicle_name}</div>
                        <div className="text-muted small">{sale.make} {sale.model}</div>
                      </td>
                      <td>
                        <div>{sale.first_name} {sale.last_name}</div>
                        <div className="text-muted small">{sale.customer}</div>
                      </td>
                      <td>{sale.id_number || '-'}</td>
                      <td>
                        <div>{sale.phone || '-'}</div>
                        <div className="text-muted small">{sale.email || '-'}</div>
                      </td>
                      <td>{sale.quantity_sold}</td>
                      <td className="fw-600">M{Number(sale.amount).toLocaleString()}</td>
                      <td className="text-success">M{Number(sale.amount_paid).toLocaleString()}</td>
                      <td className="text-warning">
                        {balance > 0 ? `M${balance.toLocaleString()}` : '-'}
                      </td>
                      <td>
                        <span className="badge badge-info">{sale.payment_method}</span>
                      </td>
                      <td>
                        <span className={`badge ${getPaymentStatusColor(sale.payment_status)}`}>
                          {sale.payment_status}
                        </span>
                      </td>
                      <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                      <td>
                        <div className="action-group" style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleDownloadInvoice(sale)}
                            className="btn btn-secondary btn-sm"
                            title="Print Invoice"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11px' }}
                          >
                            📄 Invoice
                          </button>
                          {sale.payment_status !== 'Paid' && (
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowPaymentModal(true);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              Record Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" className="text-right fw-600">Totals:</td>
                  <td className="fw-bold">
                    M{sales.reduce((sum, s) => sum + Number(s.amount), 0).toLocaleString()}
                  </td>
                  <td className="fw-bold text-success">
                    M{sales.reduce((sum, s) => sum + Number(s.amount_paid), 0).toLocaleString()}
                  </td>
                  <td className="fw-bold text-warning">
                    M{sales.reduce((sum, s) => sum + (s.amount - s.amount_paid), 0).toLocaleString()}
                  </td>
                  <td colSpan="4"></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedSale && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3 className="modal-title">Record Payment</h3>
                <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p className="mb-2">Vehicle: <strong>{selectedSale.vehicle_name}</strong></p>
                <p className="mb-2">Customer: <strong>{selectedSale.first_name} {selectedSale.last_name}</strong></p>
                <p className="mb-3">
                  Outstanding Balance: <strong className="text-warning">
                    M{(selectedSale.amount - selectedSale.amount_paid).toLocaleString()}
                  </strong>
                </p>
                
                <input
                  type="number"
                  placeholder="Payment Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="form-input mb-3"
                  autoFocus
                />
                
                <div className="modal-buttons">
                  <button
                    onClick={handleRecordPayment}
                    className="btn btn-success flex-1"
                  >
                    Record Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentAmount("");
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="modal-overlay">
            <div className="modal modal-lg">
              <div className="modal-header">
                <h3 className="modal-title">Add New Customer</h3>
                <button className="modal-close" onClick={() => setShowCustomerForm(false)}>×</button>
              </div>
              <div className="modal-body">
                <CustomerForm 
                  onSave={(customerId) => {
                    setShowCustomerForm(false);
                    fetchCustomers();
                    fetch(`${process.env.REACT_APP_API_URL}/api/customers/${customerId}`)
                      .then(res => res.json())
                      .then(customer => selectCustomer(customer));
                  }}
                  onClose={() => setShowCustomerForm(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}