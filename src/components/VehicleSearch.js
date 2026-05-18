import { useState } from "react";

export default function VehicleSearch({ onSelectVehicle, onEditVehicle, onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicles`);
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.length > 1) {
      const results = vehicles.filter(vehicle => 
        vehicle.vehicle_name?.toLowerCase().includes(term) ||
        vehicle.make?.toLowerCase().includes(term) ||
        vehicle.model?.toLowerCase().includes(term) ||
        vehicle.year?.toString().includes(term) ||
        vehicle.vin?.toLowerCase().includes(term) ||
        vehicle.registration_number?.toLowerCase().includes(term)
      );
      setSearchResults(results.slice(0, 10)); // Show top 10 results
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSelect = (vehicle) => {
    setSearchTerm("");
    setShowResults(false);
    onSelectVehicle(vehicle);
  };

  const handleEdit = (vehicle, e) => {
    e.stopPropagation();
    onEditVehicle(vehicle);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleView = (vehicle, e) => {
    e.stopPropagation();
    onViewDetails(vehicle);
    setSearchTerm("");
    setShowResults(false);
  };

  const styles = {
    container: {
      position: 'relative',
      marginBottom: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      transition: 'all 0.2s'
    },
    resultsContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000
    },
    resultItem: {
      padding: '0.75rem',
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    vehicleName: {
      fontWeight: '600',
      color: '#1f2937'
    },
    vehicleDetails: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      marginRight: '0.5rem'
    },
    buttonGroup: {
      marginTop: '0.5rem',
      display: 'flex',
      gap: '0.5rem'
    },
    button: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="🔍 Search vehicles by name, make, model, year, VIN, or registration..."
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => vehicles.length === 0 && fetchVehicles()}
        style={styles.input}
      />
      
      {showResults && searchResults.length > 0 && (
        <div style={styles.resultsContainer}>
          {searchResults.map(vehicle => (
            <div
              key={vehicle.id}
              style={styles.resultItem}
              onClick={() => handleSelect(vehicle)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <div style={styles.vehicleName}>
                {vehicle.vehicle_name || `${vehicle.make} ${vehicle.model}`}
              </div>
              <div style={styles.vehicleDetails}>
                <span style={styles.badge}>Year: {vehicle.year}</span>
                <span style={styles.badge}>Stock: {vehicle.quantity}</span>
                <span style={styles.badge}>Price: M{Number(vehicle.selling_price).toLocaleString()}</span>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  style={{...styles.button, backgroundColor: '#10b981', color: 'white'}}
                  onClick={(e) => handleSelect(vehicle, e)}
                >
                  Sell
                </button>
                <button
                  style={{...styles.button, backgroundColor: '#3b82f6', color: 'white'}}
                  onClick={(e) => handleEdit(vehicle, e)}
                >
                  Edit
                </button>
                <button
                  style={{...styles.button, backgroundColor: '#6b7280', color: 'white'}}
                  onClick={(e) => handleView(vehicle, e)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showResults && searchResults.length === 0 && searchTerm.length > 1 && (
        <div style={styles.resultsContainer}>
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
            No vehicles found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
}