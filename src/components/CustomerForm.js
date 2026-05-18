import { useState, useEffect } from "react";
import '../styles/components.css';
import '../styles/customer.css';

export default function CustomerForm({ customerId, onSave, onClose }) {
  const [customer, setCustomer] = useState({
    first_name: "",
    last_name: "",
    id_number: "",
    email: "",
    phone: "",
    alternative_phone: "",
    address: "",
    city: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/customers/${customerId}`);
      const data = await response.json();
      if (data) setCustomer(data);
    } catch (err) {
      console.error("Error fetching customer:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const url = customerId 
        ? `${process.env.REACT_APP_API_URL}/api/customers/${customerId}`
        : `${process.env.REACT_APP_API_URL}/api/customers`;
      const method = customerId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to save customer");
      
      onSave(data.id || customerId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="customer-form">
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="customer-form-grid">
        <div className="customer-form-group">
          <label className="customer-label required">First Name</label>
          <input
            type="text"
            required
            value={customer.first_name}
            onChange={(e) => setCustomer({...customer, first_name: e.target.value})}
            className="customer-input"
          />
        </div>
        
        <div className="customer-form-group">
          <label className="customer-label required">Last Name</label>
          <input
            type="text"
            required
            value={customer.last_name}
            onChange={(e) => setCustomer({...customer, last_name: e.target.value})}
            className="customer-input"
          />
        </div>
        
        <div className="customer-form-group">
          <label className="customer-label required">ID Number</label>
          <input
            type="text"
            required
            value={customer.id_number}
            onChange={(e) => setCustomer({...customer, id_number: e.target.value})}
            className="customer-input"
          />
        </div>
        
        <div className="customer-form-group">
          <label className="customer-label required">Phone</label>
          <input
            type="tel"
            required
            value={customer.phone}
            onChange={(e) => setCustomer({...customer, phone: e.target.value})}
            className="customer-input"
          />
        </div>
        
        <div className="customer-form-group">
          <label className="customer-label">Alternative Phone</label>
          <input
            type="tel"
            value={customer.alternative_phone}
            onChange={(e) => setCustomer({...customer, alternative_phone: e.target.value})}
            className="customer-input"
          />
        </div>
        
        <div className="customer-form-group">
          <label className="customer-label">Email</label>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({...customer, email: e.target.value})}
            className="customer-input"
          />
        </div>
        
        <div className="customer-form-group">
          <label className="customer-label">Address</label>
          <input
            type="text"
            value={customer.address}
            onChange={(e) => setCustomer({...customer, address: e.target.value})}
            className="customer-input"
          />
        </div>
        
        <div className="customer-form-group">
          <label className="customer-label">City</label>
          <input
            type="text"
            value={customer.city}
            onChange={(e) => setCustomer({...customer, city: e.target.value})}
            className="customer-input"
          />
        </div>
      </div>
      
      <div className="customer-form-buttons">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn btn-success">
          {loading ? "Saving..." : (customerId ? "Update" : "Save Customer")}
        </button>
      </div>
    </form>
  );
}