import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import EmployeeDetailsModal from "../components/EmployeeDetailsModal";
import '../styles/employees.css';
import '../styles/components.css';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    employee_number: "",
    first_name: "",
    last_name: "",
    id_number: "",
    email: "",
    phone: "",
    alternative_phone: "",
    address: "",
    city: "",
    position: "",
    department: "Sales",
    hire_date: new Date().toISOString().split('T')[0],
    employment_type: "Full-time",
    basic_salary: "",
    bank_name: "",
    bank_account_number: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    status: "Active",
    notes: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchSummary();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/employees");
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load employees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees/summary/salary");
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    const url = editingEmployee 
      ? `http://localhost:5000/api/employees/${editingEmployee.id}`
      : "http://localhost:5000/api/employees";
    
    const method = editingEmployee ? "PUT" : "POST";
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save employee");
      }
      
      setSuccess(editingEmployee ? "Employee updated successfully!" : "Employee added successfully!");
      resetForm();
      fetchEmployees();
      fetchSummary();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      employee_number: employee.employee_number || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      id_number: employee.id_number || "",
      email: employee.email || "",
      phone: employee.phone || "",
      alternative_phone: employee.alternative_phone || "",
      address: employee.address || "",
      city: employee.city || "",
      position: employee.position || "",
      department: employee.department || "Sales",
      hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
      employment_type: employee.employment_type || "Full-time",
      basic_salary: employee.basic_salary || "",
      bank_name: employee.bank_name || "",
      bank_account_number: employee.bank_account_number || "",
      emergency_contact_name: employee.emergency_contact_name || "",
      emergency_contact_phone: employee.emergency_contact_phone || "",
      status: employee.status || "Active",
      notes: employee.notes || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete employee");
      }
      
      setSuccess("Employee deleted successfully!");
      fetchEmployees();
      fetchSummary();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const resetForm = () => {
    setNewEmployee({
      employee_number: "",
      first_name: "",
      last_name: "",
      id_number: "",
      email: "",
      phone: "",
      alternative_phone: "",
      address: "",
      city: "",
      position: "",
      department: "Sales",
      hire_date: new Date().toISOString().split('T')[0],
      employment_type: "Full-time",
      basic_salary: "",
      bank_name: "",
      bank_account_number: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      status: "Active",
      notes: ""
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleModalClose = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
    fetchEmployees();
    fetchSummary();
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'On Leave': return 'status-onleave';
      case 'Terminated': return 'status-terminated';
      default: return '';
    }
  };

  return (
    <div className="employees-wrapper">
      <Sidebar />
      
      <div className="employees-main">
        <div className="employees-header">
          <div>
            <h1 className="employees-title">Employee Management</h1>
            <p className="employees-subtitle">Manage staff, track salaries, and monitor attendance</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <span>+</span>
            {showForm ? "Cancel" : "Add Employee"}
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card-title">Total Employees</p>
              <p className="stat-card-value">{summary.total_employees || 0}</p>
              <p className="stat-card-subtext">
                {summary.active_employees || 0} Active
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Monthly Salary Bill</p>
              <p className="stat-card-value text-primary">
                M{parseFloat(summary.monthly_salary_bill || 0).toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Average Salary</p>
              <p className="stat-card-value text-success">
                M{parseFloat(summary.average_salary || 0).toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">Departments</p>
              <p className="stat-card-value small">
                <span className="text-primary">Sales: M{parseFloat(summary.sales_department_cost || 0).toLocaleString()}</span><br/>
                <span className="text-success">Service: M{parseFloat(summary.service_department_cost || 0).toLocaleString()}</span><br/>
                <span className="text-warning">Finance: M{parseFloat(summary.finance_department_cost || 0).toLocaleString()}</span>
              </p>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {success && <div className="alert alert-success">✓ {success}</div>}
        {error && <div className="alert alert-error">✗ {error}</div>}

        {/* Employee Form */}
        {showForm && (
          <div className="form-card">
            <div className="form-card-header">
              <h3 className="form-card-title">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h3>
              <p className="form-card-subtitle">
                {editingEmployee ? "Update employee information" : "Enter complete employee details"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="employee-form">
              {/* Personal Information Section */}
              <div className="form-section">
                <h4 className="form-section-title">👤 Personal Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Employee Number</label>
                    <input
                      type="text"
                      placeholder="e.g., EMP001"
                      value={newEmployee.employee_number}
                      onChange={(e) => setNewEmployee({...newEmployee, employee_number: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">First Name</label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={newEmployee.first_name}
                      onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={newEmployee.last_name}
                      onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">ID Number</label>
                    <input
                      type="text"
                      placeholder="National ID"
                      value={newEmployee.id_number}
                      onChange={(e) => setNewEmployee({...newEmployee, id_number: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      placeholder="email@company.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Phone</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alternative Phone</label>
                    <input
                      type="tel"
                      placeholder="Alternative phone"
                      value={newEmployee.alternative_phone}
                      onChange={(e) => setNewEmployee({...newEmployee, alternative_phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      placeholder="Street address"
                      value={newEmployee.address}
                      onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={newEmployee.city}
                      onChange={(e) => setNewEmployee({...newEmployee, city: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information Section */}
              <div className="form-section">
                <h4 className="form-section-title">💼 Employment Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Position</label>
                    <input
                      type="text"
                      placeholder="e.g., Sales Manager"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Department</label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="Sales">Sales</option>
                      <option value="Service">Service</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">Human Resources</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Hire Date</label>
                    <input
                      type="date"
                      value={newEmployee.hire_date}
                      onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Employment Type</label>
                    <select
                      value={newEmployee.employment_type}
                      onChange={(e) => setNewEmployee({...newEmployee, employment_type: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Probation">Probation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Basic Salary</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newEmployee.basic_salary}
                      onChange={(e) => setNewEmployee({...newEmployee, basic_salary: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={newEmployee.status}
                      onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                      className="form-select"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Banking Information Section */}
              <div className="form-section">
                <h4 className="form-section-title">🏦 Banking Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      placeholder="Bank name"
                      value={newEmployee.bank_name}
                      onChange={(e) => setNewEmployee({...newEmployee, bank_name: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="Account number"
                      value={newEmployee.bank_account_number}
                      onChange={(e) => setNewEmployee({...newEmployee, bank_account_number: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="form-section">
                <h4 className="form-section-title">🚨 Emergency Contact</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      placeholder="Emergency contact name"
                      value={newEmployee.emergency_contact_name}
                      onChange={(e) => setNewEmployee({...newEmployee, emergency_contact_name: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="Emergency contact phone"
                      value={newEmployee.emergency_contact_phone}
                      onChange={(e) => setNewEmployee({...newEmployee, emergency_contact_phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="form-section">
                <h4 className="form-section-title">📝 Additional Notes</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      rows="3"
                      placeholder="Additional information about the employee..."
                      value={newEmployee.notes}
                      onChange={(e) => setNewEmployee({...newEmployee, notes: e.target.value})}
                      className="form-textarea"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? "Saving..." : (editingEmployee ? "Update Employee" : "Add Employee")}
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

        {/* Employees Table */}
        <div className="employees-table-container">
          <div className="table-header">
            <h3 className="table-title">Employee Directory</h3>
            <p className="table-subtitle">
              Manage employee information, track salaries, and monitor attendance
            </p>
          </div>
          
          {loading && !employees.length ? (
            <div className="loading-state">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <p>No employees found.</p>
              <p className="small mt-2">Click "Add Employee" to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee #</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Basic Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td className="font-mono">{employee.employee_number}</td>
                      <td>
                        <div className="fw-600">{employee.first_name} {employee.last_name}</div>
                        <div className="small text-muted">{employee.email || 'No email'}</div>
                      </td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td className="fw-600 text-primary">M{Number(employee.basic_salary).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-group">
                          <button
                            onClick={() => handleViewDetails(employee)}
                            className="btn-view"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEdit(employee)}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <EmployeeDetailsModal 
          employeeId={selectedEmployee.id} 
          onClose={handleModalClose}
          onUpdate={() => {
            fetchEmployees();
            fetchSummary();
          }}
        />
      )}
    </div>
  );
}