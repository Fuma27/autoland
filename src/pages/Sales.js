import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import CustomerForm from "../components/CustomerForm";
import VehicleSearch from "../components/VehicleSearch";
import { FiTruck, FiUser, FiDollarSign, FiMail, FiPrinter } from "react-icons/fi";
import '../styles/sales.css';
import '../styles/components.css';
import '../styles/sidebar.css';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sales`);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vehicles/available`);
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers`);
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sales/summary/analytics`);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/search/${query}`);
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

  // Send email receipt function
  const sendEmailReceipt = async (saleId, customerEmail, customerName) => {
    if (!customerEmail) {
      console.log("No email address provided");
      return false;
    }
    
    setSendingEmail(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/email/send-receipt/${saleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customerEmail, customerName: customerName })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(prev => prev + ` 📧 Receipt sent to ${customerEmail}`);
        return true;
      } else {
        console.error("Failed to send email:", data.error);
        setError(`Failed to send email: ${data.error}`);
        return false;
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setError("Failed to send email receipt");
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSale)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Sale failed");
      }
      
      // Send email receipt if customer has email
      const customerEmail = newSale.email || (selectedCustomer?.email);
      if (customerEmail && data.sale_id) {
        await sendEmailReceipt(data.sale_id, customerEmail, `${newSale.first_name} ${newSale.last_name}`);
      }
      
      setSuccess(`Sale completed successfully! ${data.payment_status === 'Paid' ? 'Full payment received.' : `Balance due: M${data.balance_due.toLocaleString()}`} ${customerEmail ? 'Receipt sent to email.' : ''}`);
      resetForm();
      fetchSales();
      fetchAvailableVehicles();
      fetchCustomers();
      fetchSummary();
      
      setTimeout(() => setSuccess(""), 5000);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sales/${selectedSale.id}/payment`, {
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

  const handleResendReceipt = async (sale) => {
    const customerEmail = sale.email || sale.customer_email;
    if (!customerEmail) {
      setError("No email address available for this customer");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    await sendEmailReceipt(sale.id, customerEmail, `${sale.first_name} ${sale.last_name}`);
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
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - AutoLand Motors</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e0e0e0;
          }
          .header {
            background: linear-gradient(135deg, #1a1e2b 0%, #0f172a 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            letter-spacing: 2px;
          }
          .header h1 span:first-child { color: #ef4444; }
          .header h1 span:last-child { color: #3b82f6; }
          .header p { margin: 5px 0 0; opacity: 0.8; }
          .content { padding: 30px; }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .info-box {
            background: #f8f9fa;
            padding: 15px;
            border-left: 3px solid #dc2626;
          }
          .info-box h3 {
            margin: 0 0 10px;
            font-size: 16px;
            color: #dc2626;
          }
          .info-box p {
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          th {
            background: #f8f9fa;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
          }
          .text-right { text-align: right; }
          .totals {
            width: 300px;
            margin-left: auto;
            margin-top: 20px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .totals-row.grand-total {
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
            font-weight: bold;
            font-size: 18px;
            padding: 12px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .status-paid {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-partial { background: #f59e0b; }
          .status-pending { background: #ef4444; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span>AUTO</span><span>LAND</span></h1>
            <p>Quality Used Cars | Maseru, Lesotho</p>
          </div>
          <div class="content">
            <div class="invoice-title">
              SALES INVOICE
              <span style="float:right; font-size: 14px; font-weight: normal;">
                <span class="status-paid">${sale.payment_status}</span>
              </span>
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <h3>BILL TO</h3>
                <p><strong>${sale.first_name} ${sale.last_name}</strong></p>
                <p>ID: ${sale.id_number || 'N/A'}</p>
                <p>Phone: ${sale.phone || 'N/A'}</p>
                <p>Email: ${sale.email || 'N/A'}</p>
                <p>Address: ${sale.address || ''} ${sale.city || ''}</p>
              </div>
              <div class="info-box">
                <h3>INVOICE DETAILS</h3>
                <p><strong>Invoice #:</strong> INV-${sale.id.toString().padStart(6, '0')}</p>
                <p><strong>Date:</strong> ${new Date(sale.sale_date).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${sale.payment_method}</p>
                <p><strong>Salesperson:</strong> ${sale.salesperson || 'AutoLand Team'}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Make/Model</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${sale.vehicle_name}</strong></td>
                  <td>${sale.make} ${sale.model} (${sale.year})</td>
                  <td class="text-right">${sale.quantity_sold}</td>
                  <td class="text-right">M${Number(sale.amount / sale.quantity_sold).toLocaleString()}</td>
                  <td class="text-right">M${Number(sale.amount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>M${Number(sale.amount).toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>Amount Paid:</span>
                <span style="color: #10b981;">M${Number(sale.amount_paid).toLocaleString()}</span>
              </div>
              ${balance > 0 ? `
              <div class="totals-row">
                <span>Balance Due:</span>
                <span style="color: #ef4444;">M${balance.toLocaleString()}</span>
              </div>
              ` : ''}
              <div class="totals-row grand-total">
                <span>GRAND TOTAL:</span>
                <span>M${Number(sale.amount).toLocaleString()}</span>
              </div>
            </div>

            <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 3px solid #f59e0b;">
              <p style="margin: 0; font-size: 13px;"><strong>📋 Payment Instructions:</strong> ${balance > 0 ? `Outstanding balance of M${balance.toLocaleString()} is due within 30 days.` : 'Thank you for your full payment!'}</p>
            </div>
          </div>
          <div class="footer">
            <p><strong>AutoLand Motors (Pty) Ltd</strong> | Registration No: 2019/1234 | VAT: 12345678</p>
            <p>123 Main Road, Maseru, Lesotho | Tel: +266 2231 1234 | Email: info@autoland.co.ls</p>
            <p>Thank you for choosing AutoLand. Drive safely!</p>
          </div>
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
        {sendingEmail && <div className="alert alert-info">📧 Sending email receipt...</div>}

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
                          placeholder="customer@example.com"
                          value={newSale.email}
                          onChange={(e) => setNewSale({...newSale, email: e.target.value})}
                          className="form-input"
                        />
                        <p className="form-help">Receipt will be sent to this email</p>
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
                  <th>Actions</th>
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
                        <div className="action-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleDownloadInvoice(sale)}
                            className="btn btn-secondary btn-sm"
                            title="Print Invoice"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11px' }}
                          >
                            <FiPrinter size={12} /> Print
                          </button>
                          {sale.email && (
                            <button
                              onClick={() => handleResendReceipt(sale)}
                              className="btn btn-info btn-sm"
                              title="Resend Email Receipt"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11px', background: '#0e48f1', color: 'white', border: 'none' }}
                              disabled={sendingEmail}
                            >
                              <FiMail size={12} /> Resend Receipt
                            </button>
                          )}
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
                    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/${customerId}`)
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