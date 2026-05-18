import { useState, useEffect, useCallback } from "react";
import '../styles/modal.css';
import '../styles/components.css';

export default function EmployeeDetailsModal({ employeeId, onClose, onUpdate }) {
  const [employeeData, setEmployeeData] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [newSalary, setNewSalary] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_month: new Date().toISOString().split('T')[0],
    overtime_hours: "",
    overtime_rate: "",
    bonus: "",
    allowances: "",
    deductions: "",
    tax_amount: "",
    payment_method: "Bank Transfer",
    transaction_reference: "",
    notes: ""
  });

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/employees/${employeeId}/complete`);
      const data = await response.json();
      setEmployeeData(data);
    } catch (err) {
      console.error("Error fetching employee details:", err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [fetchEmployeeDetails]);

  const handleAddSalary = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/employees/${employeeId}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSalary)
      });
      
      if (response.ok) {
        setShowSalaryForm(false);
        setNewSalary({
          payment_date: new Date().toISOString().split('T')[0],
          payment_month: new Date().toISOString().split('T')[0],
          overtime_hours: "",
          overtime_rate: "",
          bonus: "",
          allowances: "",
          deductions: "",
          tax_amount: "",
          payment_method: "Bank Transfer",
          transaction_reference: "",
          notes: ""
        });
        fetchEmployeeDetails();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Error adding salary record:", err);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="text-center p-4">Loading employee details...</div>
        </div>
      </div>
    );
  }

  if (!employeeData) return null;

  const { employee, salary_history, attendance_records } = employeeData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header bg-primary">
          <h2 className="modal-title text-white">
            {employee.first_name} {employee.last_name}
          </h2>
          <button className="modal-close text-white" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Employee Details
          </button>
          <button 
            className={`modal-tab ${activeTab === 'salary' ? 'active' : ''}`}
            onClick={() => setActiveTab('salary')}
          >
            Salary History
          </button>
          <button 
            className={`modal-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
        </div>

        <div className="modal-body">
          {/* Employee Details Tab */}
          {activeTab === 'details' && (
            <>
              <div className="form-section">
                <h3 className="form-section-title">Personal Information</h3>
                <div className="details-grid">
                  <div className="info-card">
                    <p className="info-label">Employee Number</p>
                    <p className="info-value font-mono">{employee.employee_number}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Full Name</p>
                    <p className="info-value">{employee.first_name} {employee.last_name}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">ID Number</p>
                    <p className="info-value">{employee.id_number}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Email</p>
                    <p className="info-value">{employee.email || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Phone</p>
                    <p className="info-value">{employee.phone}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Alternative Phone</p>
                    <p className="info-value">{employee.alternative_phone || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Address</p>
                    <p className="info-value">{employee.address || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">City</p>
                    <p className="info-value">{employee.city || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Employment Information</h3>
                <div className="details-grid">
                  <div className="info-card">
                    <p className="info-label">Position</p>
                    <p className="info-value">{employee.position}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Department</p>
                    <p className="info-value">{employee.department}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Hire Date</p>
                    <p className="info-value">{employee.hire_date}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Employment Type</p>
                    <p className="info-value">{employee.employment_type}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Basic Salary</p>
                    <p className="info-value text-primary">M{Number(employee.basic_salary).toLocaleString()}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Status</p>
                    <p className="info-value">{employee.status}</p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Banking Information</h3>
                <div className="details-grid">
                  <div className="info-card">
                    <p className="info-label">Bank Name</p>
                    <p className="info-value">{employee.bank_name || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Account Number</p>
                    <p className="info-value">{employee.bank_account_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Emergency Contact</h3>
                <div className="details-grid">
                  <div className="info-card">
                    <p className="info-label">Contact Name</p>
                    <p className="info-value">{employee.emergency_contact_name || 'N/A'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label">Contact Phone</p>
                    <p className="info-value">{employee.emergency_contact_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {employee.notes && (
                <div className="form-section">
                  <h3 className="form-section-title">Notes</h3>
                  <div className="info-card">
                    <p className="info-value">{employee.notes}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Salary History Tab */}
          {activeTab === 'salary' && (
            <div>
              <button className="btn btn-primary btn-sm mb-3" onClick={() => setShowSalaryForm(!showSalaryForm)}>
                + Record Salary Payment
              </button>

              {showSalaryForm && (
                <form className="form-card p-3 mb-3" onSubmit={handleAddSalary}>
                  <h4 className="fw-600 mb-3">Record Salary Payment</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Payment Date</label>
                      <input type="date" value={newSalary.payment_date} onChange={(e) => setNewSalary({...newSalary, payment_date: e.target.value})} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Month</label>
                      <input type="date" value={newSalary.payment_month} onChange={(e) => setNewSalary({...newSalary, payment_month: e.target.value})} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Overtime Hours</label>
                      <input type="number" step="0.5" placeholder="0" value={newSalary.overtime_hours} onChange={(e) => setNewSalary({...newSalary, overtime_hours: e.target.value})} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Overtime Rate</label>
                      <input type="number" placeholder="0" value={newSalary.overtime_rate} onChange={(e) => setNewSalary({...newSalary, overtime_rate: e.target.value})} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bonus</label>
                      <input type="number" placeholder="0" value={newSalary.bonus} onChange={(e) => setNewSalary({...newSalary, bonus: e.target.value})} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Allowances</label>
                      <input type="number" placeholder="0" value={newSalary.allowances} onChange={(e) => setNewSalary({...newSalary, allowances: e.target.value})} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Deductions</label>
                      <input type="number" placeholder="0" value={newSalary.deductions} onChange={(e) => setNewSalary({...newSalary, deductions: e.target.value})} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tax Amount</label>
                      <input type="number" placeholder="0" value={newSalary.tax_amount} onChange={(e) => setNewSalary({...newSalary, tax_amount: e.target.value})} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select value={newSalary.payment_method} onChange={(e) => setNewSalary({...newSalary, payment_method: e.target.value})} className="form-select">
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Transaction Reference</label>
                      <input type="text" placeholder="Reference number" value={newSalary.transaction_reference} onChange={(e) => setNewSalary({...newSalary, transaction_reference: e.target.value})} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <textarea rows="2" placeholder="Additional notes" value={newSalary.notes} onChange={(e) => setNewSalary({...newSalary, notes: e.target.value})} className="form-textarea" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success mt-3">Save Salary Record</button>
                </form>
              )}

              {salary_history.length === 0 ? (
                <p className="text-muted">No salary records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment Date</th>
                        <th>Month</th>
                        <th>Basic Salary</th>
                        <th>Overtime</th>
                        <th>Bonus</th>
                        <th>Deductions</th>
                        <th>Tax</th>
                        <th>Net Salary</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salary_history.map(record => (
                        <tr key={record.id}>
                          <td>{record.payment_date}</td>
                          <td>{record.payment_month}</td>
                          <td className="fw-600">M{Number(record.basic_salary).toLocaleString()}</td>
                          <td className="text-success">M{Number(record.overtime_pay).toLocaleString()}</td>
                          <td className="text-success">M{Number(record.bonus).toLocaleString()}</td>
                          <td className="text-danger">M{Number(record.deductions).toLocaleString()}</td>
                          <td className="text-danger">M{Number(record.tax_amount).toLocaleString()}</td>
                          <td className="fw-600 text-primary">M{Number(record.net_salary).toLocaleString()}</td>
                          <td>{record.payment_method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div>
              <p className="text-muted">Attendance records will be displayed here.</p>
              {attendance_records.length === 0 ? (
                <p className="text-muted mt-3">No attendance records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance_records.map(record => (
                        <tr key={record.id}>
                          <td>{record.attendance_date}</td>
                          <td>{record.check_in || '-'}</td>
                          <td>{record.check_out || '-'}</td>
                          <td>{record.hours_worked || '-'}</td>
                          <td>
                            <span className={`badge ${record.status === 'Present' ? 'badge-success' : record.status === 'Absent' ? 'badge-danger' : 'badge-warning'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td>{record.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}