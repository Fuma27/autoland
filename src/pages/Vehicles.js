import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import '../styles/vehicles.css';
import '../styles/components.css';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [newVehicle, setNewVehicle] = useState({
    vehicle_name: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    engine_size: "",
    transmission: "Automatic",
    fuel_type: "Petrol",
    color: "",
    mileage: "",
    vehicle_condition: "Good",
    previous_owners: 0,
    registration_number: "",
    purchase_price: "",
    repair_cost: "",
    selling_price: "",
    vin: "",
    quantity: 1,
    location: "Main Showroom",
    last_service_date: "",
    notes: "",
    status: "available"
  });

  useEffect(() => {
    fetchVehicles();
    fetchSummary();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/vehicles");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/vehicles/summary/profit");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const calculateTotalCost = () => {
    const purchase = parseFloat(newVehicle.purchase_price) || 0;
    const repair = parseFloat(newVehicle.repair_cost) || 0;
    return purchase + repair;
  };

  const calculateProfit = () => {
    const totalCost = calculateTotalCost();
    const selling = parseFloat(newVehicle.selling_price) || 0;
    return selling - totalCost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    const url = editingVehicle 
      ? `http://localhost:5000/api/vehicles/${editingVehicle.id}`
      : "http://localhost:5000/api/vehicles";
    
    const method = editingVehicle ? "PUT" : "POST";
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicle)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save vehicle");
      }
      
      setSuccess(editingVehicle ? "Vehicle updated successfully!" : "Vehicle added successfully!");
      resetForm();
      await fetchVehicles();
      await fetchSummary();
      
      // 🔄 Trigger dashboard refresh
      window.dispatchEvent(new Event('data-updated'));
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setNewVehicle({
      vehicle_name: vehicle.vehicle_name || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      engine_size: vehicle.engine_size || "",
      transmission: vehicle.transmission || "Automatic",
      fuel_type: vehicle.fuel_type || "Petrol",
      color: vehicle.color || "",
      mileage: vehicle.mileage || "",
      vehicle_condition: vehicle.vehicle_condition || "Good",
      previous_owners: vehicle.previous_owners || 0,
      registration_number: vehicle.registration_number || "",
      purchase_price: vehicle.purchase_price || "",
      repair_cost: vehicle.repair_cost || 0,
      selling_price: vehicle.selling_price || "",
      vin: vehicle.vin || "",
      quantity: vehicle.quantity || 1,
      location: vehicle.location || "Main Showroom",
      last_service_date: vehicle.last_service_date || "",
      notes: vehicle.notes || "",
      status: vehicle.status || "available"
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete vehicle");
      }
      
      setSuccess("Vehicle deleted successfully!");
      await fetchVehicles();
      await fetchSummary();
      
      // 🔄 Trigger dashboard refresh
      window.dispatchEvent(new Event('data-updated'));
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const resetForm = () => {
    setNewVehicle({
      vehicle_name: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      engine_size: "",
      transmission: "Automatic",
      fuel_type: "Petrol",
      color: "",
      mileage: "",
      vehicle_condition: "Good",
      previous_owners: 0,
      registration_number: "",
      purchase_price: "",
      repair_cost: "",
      selling_price: "",
      vin: "",
      quantity: 1,
      location: "Main Showroom",
      last_service_date: "",
      notes: "",
      status: "available"
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleModalClose = async () => {
    setShowDetailsModal(false);
    setSelectedVehicle(null);
    // Refresh data when modal closes
    await fetchVehicles();
    await fetchSummary();
    // Trigger dashboard refresh
    window.dispatchEvent(new Event('data-updated'));
  };

  const getProfitClass = (profit) => {
    if (profit > 0) return 'text-success';
    if (profit < 0) return 'text-danger';
    return 'text-muted';
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
    <div className="vehicles-container">
      <Sidebar />
      
      <div className="vehicles-main">
        <div className="vehicles-header">
          <div>
            <h1 className="vehicles-title">Vehicle Management</h1>
            <p className="vehicles-subtitle">Manage your vehicle inventory with complete details</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <span>+</span>
            {showForm ? "Cancel" : "Add New Vehicle"}
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card-title">Total Vehicles</p>
              <p className="stat-card-value">{summary.total_vehicles || 0}</p>
              <p className="stat-card-subtext">
                {summary.available_vehicles || 0} Available | {summary.sold_vehicles || 0} Sold
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Total Investment</p>
              <p className="stat-card-value">M{parseFloat(summary.total_investment || 0).toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Potential Revenue</p>
              <p className="stat-card-value text-primary">
                M{parseFloat(summary.total_potential_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Total Potential Profit</p>
              <p className={`stat-card-value ${parseFloat(summary.total_potential_profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                M{parseFloat(summary.total_potential_profit || 0).toLocaleString()}
              </p>
              <p className="stat-card-subtext">
                Avg Profit: M{parseFloat(summary.average_profit_per_vehicle || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {success && <div className="alert alert-success">✓ {success}</div>}
        {error && <div className="alert alert-error">✗ {error}</div>}

        {/* Vehicle Form */}
        {showForm && (
          <div className="form-card">
            <div className="form-card-header">
              <h3 className="form-card-title">
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </h3>
              <p className="form-card-subtitle">
                {editingVehicle ? "Update vehicle information" : "Enter complete vehicle details including specifications"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="vehicle-form">
              {/* Basic Information Section */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <span>🚗</span> Basic Information
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Vehicle Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Toyota Corolla 2020"
                      value={newVehicle.vehicle_name}
                      onChange={(e) => setNewVehicle({...newVehicle, vehicle_name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Make</label>
                    <input
                      type="text"
                      placeholder="e.g., Toyota"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Model</label>
                    <input
                      type="text"
                      placeholder="e.g., Corolla"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Year</label>
                    <input
                      type="number"
                      placeholder="Year"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Number</label>
                    <input
                      type="text"
                      placeholder="e.g., ABC-1234"
                      value={newVehicle.registration_number}
                      onChange={(e) => setNewVehicle({...newVehicle, registration_number: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">VIN</label>
                    <input
                      type="text"
                      placeholder="Vehicle Identification Number"
                      value={newVehicle.vin}
                      onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <span>🔧</span> Technical Specifications
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Engine Size</label>
                    <input
                      type="text"
                      placeholder="e.g., 1.8L, 2.0L V6"
                      value={newVehicle.engine_size}
                      onChange={(e) => setNewVehicle({...newVehicle, engine_size: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Transmission</label>
                    <select
                      value={newVehicle.transmission}
                      onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})}
                      className="form-select"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="CVT">CVT</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fuel Type</label>
                    <select
                      value={newVehicle.fuel_type}
                      onChange={(e) => setNewVehicle({...newVehicle, fuel_type: e.target.value})}
                      className="form-select"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input
                      type="text"
                      placeholder="e.g., White, Black, Silver"
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mileage (km)</label>
                    <input
                      type="number"
                      placeholder="Current mileage"
                      value={newVehicle.mileage}
                      onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select
                      value={newVehicle.vehicle_condition}
                      onChange={(e) => setNewVehicle({...newVehicle, vehicle_condition: e.target.value})}
                      className="form-select"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Previous Owners</label>
                    <input
                      type="number"
                      placeholder="Number of previous owners"
                      value={newVehicle.previous_owners}
                      onChange={(e) => setNewVehicle({...newVehicle, previous_owners: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <span>💰</span> Financial Information
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Purchase Price</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newVehicle.purchase_price}
                      onChange={(e) => setNewVehicle({...newVehicle, purchase_price: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Repair Cost</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newVehicle.repair_cost}
                      onChange={(e) => setNewVehicle({...newVehicle, repair_cost: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Selling Price</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newVehicle.selling_price}
                      onChange={(e) => setNewVehicle({...newVehicle, selling_price: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Quantity in stock"
                      value={newVehicle.quantity}
                      onChange={(e) => setNewVehicle({...newVehicle, quantity: parseInt(e.target.value)})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location & Service Section */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <span>📍</span> Location & Service
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      placeholder="e.g., Main Showroom, South Branch"
                      value={newVehicle.location}
                      onChange={(e) => setNewVehicle({...newVehicle, location: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Service Date</label>
                    <input
                      type="date"
                      value={newVehicle.last_service_date}
                      onChange={(e) => setNewVehicle({...newVehicle, last_service_date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={newVehicle.status}
                      onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                      className="form-select"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <span>📝</span> Additional Notes
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      rows="3"
                      placeholder="Additional information about the vehicle..."
                      value={newVehicle.notes}
                      onChange={(e) => setNewVehicle({...newVehicle, notes: e.target.value})}
                      className="form-textarea"
                    />
                  </div>
                </div>
              </div>
              
              {/* Financial Summary */}
              {(newVehicle.purchase_price || newVehicle.repair_cost || newVehicle.selling_price) && (
                <div className="financial-summary">
                  <h4 className="fw-600 mb-2">Financial Summary</h4>
                  <div className="financial-summary-grid">
                    <div className="financial-summary-box">
                      <p className="text-muted small">Total Cost</p>
                      <p className="fw-bold fs-4">M{calculateTotalCost().toLocaleString()}</p>
                    </div>
                    <div className="financial-summary-box">
                      <p className="text-muted small">Selling Price</p>
                      <p className="fw-bold fs-4">M{(parseFloat(newVehicle.selling_price) || 0).toLocaleString()}</p>
                    </div>
                    <div className="financial-summary-box">
                      <p className="text-muted small">Profit/Loss</p>
                      <p className={`fw-bold fs-4 ${calculateProfit() >= 0 ? 'text-success' : 'text-danger'}`}>
                        M{calculateProfit().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? "Saving..." : (editingVehicle ? "Update Vehicle" : "Add Vehicle")}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles Table */}
        <div className="vehicle-table-container">
          <div className="table-header">
            <h3 className="table-title">Vehicle Inventory</h3>
            <p className="table-subtitle">
              Click "View Details" for complete vehicle history including maintenance and repairs
            </p>
          </div>
          
          {loading && !vehicles.length ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state">
              <p>No vehicles found.</p>
              <p className="small mt-2">Click "Add New Vehicle" to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="vehicle-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Year</th>
                    <th>Total Cost</th>
                    <th>Selling Price</th>
                    <th>Potential Profit</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const totalCost = Number(vehicle.total_cost || (vehicle.purchase_price + (vehicle.repair_cost || 0)));
                    const profit = vehicle.profit || (vehicle.selling_price - totalCost);
                    
                    return (
                      <tr key={vehicle.id}>
                        <td className="font-mono">#{vehicle.id}</td>
                        <td>
                          <div className="fw-500">{vehicle.vehicle_name || `${vehicle.make} ${vehicle.model}`}</div>
                          <div className="small text-muted">{vehicle.make} {vehicle.model}</div>
                        </td>
                        <td>{vehicle.year}</td>
                        <td className="text-danger">M{totalCost.toLocaleString()}</td>
                        <td className="text-primary">M{Number(vehicle.selling_price).toLocaleString()}</td>
                        <td className={getProfitClass(profit)}>
                          M{Math.abs(profit).toLocaleString()} {profit < 0 ? '(Loss)' : ''}
                        </td>
                        <td>
                          <span className={`stock-badge ${getStockClass(vehicle.quantity)}`}>
                            {vehicle.quantity} {vehicle.quantity === 1 ? 'unit' : 'units'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            <button
                              onClick={() => handleViewDetails(vehicle)}
                              className="btn-view"
                              title="View complete vehicle history"
                            >
                              📋 View Details
                            </button>
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="btn-edit"
                              title="Edit vehicle"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="btn-delete"
                              title="Delete vehicle"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right fw-600">Totals:</td>
                    <td className="fw-bold text-danger">
                      M{vehicles.reduce((sum, v) => sum + Number(v.total_cost || (v.purchase_price + (v.repair_cost || 0))), 0).toLocaleString()}
                    </td>
                    <td className="fw-bold text-primary">
                      M{vehicles.reduce((sum, v) => sum + Number(v.selling_price), 0).toLocaleString()}
                    </td>
                    <td className="fw-bold text-success">
                      M{vehicles.reduce((sum, v) => sum + Number(v.profit || (v.selling_price - (v.purchase_price + (v.repair_cost || 0)))), 0).toLocaleString()}
                    </td>
                    <td colSpan="3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <VehicleDetailsModal 
          vehicleId={selectedVehicle.id} 
          onClose={handleModalClose}
          onUpdate={async () => {
            await fetchVehicles();
            await fetchSummary();
            window.dispatchEvent(new Event('data-updated'));
          }}
        />
      )}
    </div>
  );
}