import { useState, useEffect, useCallback } from "react";
import '../styles/modal.css';
import '../styles/components.css';

export default function VehicleDetailsModal({ vehicleId, onClose, onUpdate }) {
  const [vehicleData, setVehicleData] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    maintenance_date: new Date().toISOString().split('T')[0],
    maintenance_type: "",
    description: "",
    cost: "",
    mechanic_name: "",
    next_maintenance_date: ""
  });
  const [newRepair, setNewRepair] = useState({
    repair_date: new Date().toISOString().split('T')[0],
    repair_type: "",
    description: "",
    parts_cost: "",
    labor_cost: "",
    mechanic_name: "",
    warranty_months: ""
  });

  const fetchVehicleDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicle-details/${vehicleId}/complete`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVehicleData(data);
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicle-details/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMaintenance, vehicle_id: vehicleId })
      });
      
      if (response.ok) {
        setShowMaintenanceForm(false);
        setNewMaintenance({
          maintenance_date: new Date().toISOString().split('T')[0],
          maintenance_type: "",
          description: "",
          cost: "",
          mechanic_name: "",
          next_maintenance_date: ""
        });
        await fetchVehicleDetails(); // Refresh modal data
        
        // 🔄 Trigger parent update
        if (onUpdate) {
          onUpdate();
        }
        
        // Also dispatch global event for dashboard
        window.dispatchEvent(new Event('data-updated'));
        
        alert("Maintenance record added successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to add maintenance record"}`);
      }
    } catch (err) {
      console.error("Error adding maintenance:", err);
      alert("Failed to add maintenance record");
    }
  };

  const handleAddRepair = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicle-details/repairs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRepair, vehicle_id: vehicleId })
      });
      
      if (response.ok) {
        setShowRepairForm(false);
        setNewRepair({
          repair_date: new Date().toISOString().split('T')[0],
          repair_type: "",
          description: "",
          parts_cost: "",
          labor_cost: "",
          mechanic_name: "",
          warranty_months: ""
        });
        await fetchVehicleDetails(); // Refresh modal data
        
        // 🔄 Trigger parent update
        if (onUpdate) {
          onUpdate();
        }
        
        // Also dispatch global event for dashboard
        window.dispatchEvent(new Event('data-updated'));
        
        alert("Repair record added successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to add repair record"}`);
      }
    } catch (err) {
      console.error("Error adding repair:", err);
      alert("Failed to add repair record");
    }
  };

  const handlePrintVehicleDetails = () => {
    if (!vehicleData) return;
    const { vehicle, maintenance_records, repair_history, total_maintenance_cost, total_repair_cost } = vehicleData;
    const printWindow = window.open("", "_blank");
    
    const totalMaintenance = Number(total_maintenance_cost || 0);
    const totalRepair = Number(total_repair_cost || 0);
    const totalCost = Number(vehicle.purchase_price) + Number(vehicle.repair_cost || 0) + totalMaintenance + totalRepair;
    const profitLoss = vehicle.selling_price - totalCost;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${vehicle.vehicle_name} - Spec Sheet</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #333;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-section h2 {
              margin: 5px 0 0 0;
              font-size: 24px;
              font-weight: 800;
            }
            .logo-section h2 span:first-child { color: #000; }
            .logo-section h2 span:last-child { color: #0e48f1; }
            .title {
              font-size: 22px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 15px;
              font-weight: bold;
              text-transform: uppercase;
              background-color: #f3f4f6;
              padding: 8px 12px;
              margin-bottom: 15px;
              border-left: 4px solid #0e48f1;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .item {
              background-color: #fafafa;
              padding: 10px;
              border: 1px solid #eee;
            }
            .item-label {
              font-size: 11px;
              color: #777;
              text-transform: uppercase;
              margin: 0 0 5px 0;
            }
            .item-value {
              font-size: 14px;
              font-weight: bold;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #eee;
              font-size: 13px;
            }
            th {
              background-color: #f9fafb;
              font-weight: bold;
            }
            .text-danger { color: #ef4444; }
            .text-success { color: #10b981; }
            .footer {
              text-align: center;
              font-size: 11px;
              color: #777;
              border-top: 1px solid #eee;
              padding-top: 20px;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <img src="/autoland-logo.png" alt="AutoLand Logo" style="height: 40px; object-fit: contain;" onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='block';" />
              <div id="logo-fallback" style="display:none; font-size: 24px; font-weight: 800;"><span style="color:#000;">AUTO</span><span style="color:#0e48f1;">LAND</span></div>
            </div>
            <div style="text-align: right;">
              <div class="title">Vehicle Spec Sheet & History</div>
              <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Basic Information & Technical Specs</div>
            <div class="grid">
              <div class="item">
                <p class="item-label">Vehicle Name</p>
                <p class="item-value">${vehicle.vehicle_name || `${vehicle.make} ${vehicle.model}`}</p>
              </div>
              <div class="item">
                <p class="item-label">Make & Model</p>
                <p class="item-value">${vehicle.make} ${vehicle.model}</p>
              </div>
              <div class="item">
                <p class="item-label">Year</p>
                <p class="item-value">${vehicle.year}</p>
              </div>
              <div class="item">
                <p class="item-label">VIN</p>
                <p class="item-value">${vehicle.vin || 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Registration Number</p>
                <p class="item-value">${vehicle.registration_number || 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Engine Size</p>
                <p class="item-value">${vehicle.engine_size || 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Transmission</p>
                <p class="item-value">${vehicle.transmission || 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Fuel Type</p>
                <p class="item-value">${vehicle.fuel_type || 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Color</p>
                <p class="item-value">${vehicle.color || 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Mileage</p>
                <p class="item-value">${vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Condition</p>
                <p class="item-value">${vehicle.vehicle_condition || 'N/A'}</p>
              </div>
              <div class="item">
                <p class="item-label">Status</p>
                <p class="item-value">${vehicle.status}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Cost Analysis & Valuation</div>
            <div class="grid">
              <div class="item">
                <p class="item-label">Purchase Price</p>
                <p class="item-value">M${Number(vehicle.purchase_price).toLocaleString()}</p>
              </div>
              <div class="item">
                <p class="item-label">Initial Repairs</p>
                <p class="item-value">M${Number(vehicle.repair_cost || 0).toLocaleString()}</p>
              </div>
              <div class="item">
                <p class="item-label">Ongoing Maintenance</p>
                <p class="item-value">M${totalMaintenance.toLocaleString()}</p>
              </div>
              <div class="item">
                <p class="item-label">Ongoing Repairs</p>
                <p class="item-value">M${totalRepair.toLocaleString()}</p>
              </div>
              <div class="item">
                <p class="item-label">Total Investment</p>
                <p class="item-value text-danger">M${totalCost.toLocaleString()}</p>
              </div>
              <div class="item">
                <p class="item-label">Selling Price</p>
                <p class="item-value">M${Number(vehicle.selling_price).toLocaleString()}</p>
              </div>
              <div class="item" style="grid-column: span 3; background-color: #f0fdf4;">
                <p class="item-label">Net Profit / Loss</p>
                <p class="item-value ${profitLoss >= 0 ? 'text-success' : 'text-danger'}" style="font-size: 18px;">
                  M${profitLoss.toLocaleString()} (${totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(1) : 0}% ROI)
                </p>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Maintenance & Repair Log</div>
            ${maintenance_records.length === 0 && repair_history.length === 0 ? `
              <p style="font-size: 13px; color: #777;">No repair or maintenance history logged for this vehicle.</p>
            ` : `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th style="text-align: right;">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  ${maintenance_records.map(record => `
                    <tr>
                      <td>${record.maintenance_date}</td>
                      <td>${record.maintenance_type}</td>
                      <td>${record.description}</td>
                      <td>Maintenance</td>
                      <td style="text-align: right;" class="text-danger">M${Number(record.cost).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                  ${repair_history.map(record => `
                    <tr>
                      <td>${record.repair_date}</td>
                      <td>${record.repair_type}</td>
                      <td>${record.description}</td>
                      <td>Repair</td>
                      <td style="text-align: right;" class="text-danger">M${Number(record.total_cost).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>

          <div class="footer">
            AutoLand Management System - Internal Vehicle Record
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

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="text-center p-4">Loading vehicle details...</div>
        </div>
      </div>
    );
  }

  if (!vehicleData) return null;

  const { vehicle, maintenance_records, repair_history, total_maintenance_cost, total_repair_cost } = vehicleData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header bg-primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 className="modal-title text-white">
              {vehicle.vehicle_name || `${vehicle.make} ${vehicle.model}`}
            </h2>
            <button 
              onClick={handlePrintVehicleDetails} 
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
            >
              📄 Print / Spec Sheet
            </button>
          </div>
          <button className="modal-close text-white" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Vehicle Details
          </button>
          <button 
            className={`modal-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance Records
          </button>
          <button 
            className={`modal-tab ${activeTab === 'repairs' ? 'active' : ''}`}
            onClick={() => setActiveTab('repairs')}
          >
            Repair History
          </button>
          <button 
            className={`modal-tab ${activeTab === 'costs' ? 'active' : ''}`}
            onClick={() => setActiveTab('costs')}
          >
            Cost Analysis
          </button>
        </div>

        <div className="modal-body">
          {/* Vehicle Details Tab */}
          {activeTab === 'details' && (
            <>
              <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>
                <div className="details-grid">
                  <div className="info-card">
                    <p className="info-label">Make & Model</p>
                    <p className="info-value">{vehicle.make} {vehicle.model}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Year</p>
                    <p className="info-value">{vehicle.year}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Registration Number</p>
                    <p className="info-value">{vehicle.registration_number || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">VIN</p>
                    <p className="info-value">{vehicle.vin || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Technical Specifications</h3>
                <div className="details-grid">
                  <div className="info-card">
                    <p className="info-label">Engine Size</p>
                    <p className="info-value">{vehicle.engine_size || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Transmission</p>
                    <p className="info-value">{vehicle.transmission || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Fuel Type</p>
                    <p className="info-value">{vehicle.fuel_type || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Color</p>
                    <p className="info-value">{vehicle.color || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Mileage</p>
                    <p className="info-value">{vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Condition</p>
                    <p className="info-value">{vehicle.vehicle_condition || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Previous Owners</p>
                    <p className="info-value">{vehicle.previous_owners || 0}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Status</p>
                    <p className="info-value">{vehicle.status}</p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Financial Information</h3>
                <div className="details-grid">
                  <div className="info-card">
                    <p className="info-label">Purchase Price</p>
                    <p className="info-value">M{Number(vehicle.purchase_price).toLocaleString()}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Initial Repair Cost</p>
                    <p className="info-value">M{Number(vehicle.repair_cost || 0).toLocaleString()}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Total Initial Cost</p>
                    <p className="info-value">M{Number(vehicle.total_cost).toLocaleString()}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Selling Price</p>
                    <p className="info-value">M{Number(vehicle.selling_price).toLocaleString()}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Potential Profit</p>
                    <p className={`info-value ${vehicle.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      M{Number(vehicle.profit).toLocaleString()}
                    </p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Quantity in Stock</p>
                    <p className="info-value">{vehicle.quantity} units</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Maintenance Records Tab */}
          {activeTab === 'maintenance' && (
            <div>
              <button className="btn btn-primary btn-sm mb-3" onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}>
                + Add Maintenance Record
              </button>

              {showMaintenanceForm && (
                <form className="form-card p-3 mb-3" onSubmit={handleAddMaintenance}>
                  <h4 className="fw-600 mb-3">New Maintenance Record</h4>
                  <div className="form-grid">
                    <input type="date" value={newMaintenance.maintenance_date} onChange={(e) => setNewMaintenance({...newMaintenance, maintenance_date: e.target.value})} className="form-input" required />
                    <input type="text" placeholder="Maintenance Type" value={newMaintenance.maintenance_type} onChange={(e) => setNewMaintenance({...newMaintenance, maintenance_type: e.target.value})} className="form-input" required />
                    <input type="text" placeholder="Description" value={newMaintenance.description} onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})} className="form-input" required />
                    <input type="number" placeholder="Cost" value={newMaintenance.cost} onChange={(e) => setNewMaintenance({...newMaintenance, cost: e.target.value})} className="form-input" required />
                    <input type="text" placeholder="Mechanic Name" value={newMaintenance.mechanic_name} onChange={(e) => setNewMaintenance({...newMaintenance, mechanic_name: e.target.value})} className="form-input" />
                    <input type="date" placeholder="Next Maintenance Date" value={newMaintenance.next_maintenance_date} onChange={(e) => setNewMaintenance({...newMaintenance, next_maintenance_date: e.target.value})} className="form-input" />
                  </div>
                  <button type="submit" className="btn btn-success mt-3">Save Record</button>
                </form>
              )}

              {maintenance_records.length === 0 ? (
                <p className="text-muted">No maintenance records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Description</th><th>Cost</th><th>Mechanic</th><th>Next Service</th></tr>
                    </thead>
                    <tbody>
                      {maintenance_records.map(record => (
                        <tr key={record.id}>
                          <td>{record.maintenance_date}</td>
                          <td>{record.maintenance_type}</td>
                          <td>{record.description}</td>
                          <td className="text-danger">M{Number(record.cost).toLocaleString()}</td>
                          <td>{record.mechanic_name || '-'}</td>
                          <td>{record.next_maintenance_date || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Repair History Tab */}
          {activeTab === 'repairs' && (
            <div>
              <button className="btn btn-primary btn-sm mb-3" onClick={() => setShowRepairForm(!showRepairForm)}>
                + Add Repair Record
              </button>

              {showRepairForm && (
                <form className="form-card p-3 mb-3" onSubmit={handleAddRepair}>
                  <h4 className="fw-600 mb-3">New Repair Record</h4>
                  <div className="form-grid">
                    <input type="date" value={newRepair.repair_date} onChange={(e) => setNewRepair({...newRepair, repair_date: e.target.value})} className="form-input" required />
                    <input type="text" placeholder="Repair Type" value={newRepair.repair_type} onChange={(e) => setNewRepair({...newRepair, repair_type: e.target.value})} className="form-input" required />
                    <input type="text" placeholder="Description" value={newRepair.description} onChange={(e) => setNewRepair({...newRepair, description: e.target.value})} className="form-input" required />
                    <input type="number" placeholder="Parts Cost" value={newRepair.parts_cost} onChange={(e) => setNewRepair({...newRepair, parts_cost: e.target.value})} className="form-input" />
                    <input type="number" placeholder="Labor Cost" value={newRepair.labor_cost} onChange={(e) => setNewRepair({...newRepair, labor_cost: e.target.value})} className="form-input" />
                    <input type="text" placeholder="Mechanic Name" value={newRepair.mechanic_name} onChange={(e) => setNewRepair({...newRepair, mechanic_name: e.target.value})} className="form-input" />
                    <input type="number" placeholder="Warranty (months)" value={newRepair.warranty_months} onChange={(e) => setNewRepair({...newRepair, warranty_months: e.target.value})} className="form-input" />
                  </div>
                  <button type="submit" className="btn btn-success mt-3">Save Record</button>
                </form>
              )}

              {repair_history.length === 0 ? (
                <p className="text-muted">No repair records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Description</th><th>Parts Cost</th><th>Labor Cost</th><th>Total Cost</th><th>Mechanic</th></tr>
                    </thead>
                    <tbody>
                      {repair_history.map(record => (
                        <tr key={record.id}>
                          <td>{record.repair_date}</td>
                          <td>{record.repair_type}</td>
                          <td>{record.description}</td>
                          <td>M{Number(record.parts_cost).toLocaleString()}</td>
                          <td>M{Number(record.labor_cost).toLocaleString()}</td>
                          <td className="text-danger">M{Number(record.total_cost).toLocaleString()}</td>
                          <td>{record.mechanic_name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Cost Analysis Tab */}
          {activeTab === 'costs' && (
            <div className="details-grid">
              <div className="info-card">
                <p className="info-label">Initial Purchase Cost</p>
                <p className="info-value">M{Number(vehicle.purchase_price).toLocaleString()}</p>
              </div>
              <div className="info-card">
                <p className="info-label">Initial Repair Cost</p>
                <p className="info-value">M{Number(vehicle.repair_cost || 0).toLocaleString()}</p>
              </div>
              <div className="info-card">
                <p className="info-label">Maintenance Total</p>
                <p className="info-value">M{Number(total_maintenance_cost).toLocaleString()}</p>
              </div>
              <div className="info-card">
                <p className="info-label">Repair Total</p>
                <p className="info-value">M{Number(total_repair_cost).toLocaleString()}</p>
              </div>
              <div className="info-card">
                <p className="info-label">Total Investment</p>
                <p className="info-value text-danger">
                  M{(Number(vehicle.purchase_price) + Number(vehicle.repair_cost || 0) + total_maintenance_cost + total_repair_cost).toLocaleString()}
                </p>
              </div>
              <div className="info-card">
                <p className="info-label">Selling Price</p>
                <p className="info-value">M{Number(vehicle.selling_price).toLocaleString()}</p>
              </div>
              <div className="info-card">
                <p className="info-label">Net Profit/Loss</p>
                <p className={`info-value ${(vehicle.selling_price - (Number(vehicle.purchase_price) + Number(vehicle.repair_cost || 0) + total_maintenance_cost + total_repair_cost)) >= 0 ? 'text-success' : 'text-danger'}`}>
                  M{(vehicle.selling_price - (Number(vehicle.purchase_price) + Number(vehicle.repair_cost || 0) + total_maintenance_cost + total_repair_cost)).toLocaleString()}
                </p>
              </div>
              <div className="info-card">
                <p className="info-label">ROI</p>
                <p className="info-value">
                  {((vehicle.selling_price - (Number(vehicle.purchase_price) + Number(vehicle.repair_cost || 0) + total_maintenance_cost + total_repair_cost)) / (Number(vehicle.purchase_price) + Number(vehicle.repair_cost || 0) + total_maintenance_cost + total_repair_cost) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}