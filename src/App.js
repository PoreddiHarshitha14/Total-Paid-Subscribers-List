import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [subscribers, setSubscribers] = useState(() => {
    const saved = localStorage.getItem('subscribers');
    return saved ? JSON.parse(saved) : [];
  });
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    email: '',
    tradingViewId: '',
    plan: '',
    pricing: '',
    commission: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [viewDetails, setViewDetails] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (formData.plan && formData.startDate) {
      const startDate = new Date(formData.startDate);
      let expiryDate = new Date(startDate);

      switch(formData.plan) {
        case 'basic':
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          break;
        case 'premium':
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          break;
        case 'pro':
          expiryDate.setMonth(expiryDate.getMonth() + 6);
          break;
        case 'enterprise':
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          break;
        default:
          expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      const formattedExpiryDate = expiryDate.toISOString().split('T')[0];
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setFormData(prev => ({
        ...prev,
        expiryDate: formattedExpiryDate,
        remainingDays: diffDays > 0 ? diffDays : 0
      }));
    }
  }, [formData.plan, formData.startDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const status = formData.remainingDays > 0 ? 'active' : 'expired';

    let referralId = formData.referralId;
    if (!referralId) {
      const nextNumber = subscribers.length + 1;
      referralId = `REF${String(nextNumber).padStart(4, '0')}`;
    }

    if (editingId !== null) {
      setSubscribers(subscribers.map(sub =>
        sub.id === editingId ? { ...formData, referralId, id: editingId, status } : sub
      ));
      setEditingId(null);
      setSuccessMsg('Subscriber updated successfully!');
    } else {
      const newSubscriber = {
        ...formData,
        referralId,
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        status
      };
      setSubscribers([...subscribers, newSubscriber]);
      setSuccessMsg('Subscriber added successfully!');
    }

    setFormData({
      userName: '',
      phoneNumber: '',
      email: '',
      tradingViewId: '',
      plan: '',
      pricing: '',
      commission: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: ''
    });

    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleEdit = (id) => {
    const subscriberToEdit = subscribers.find(sub => sub.id === id);
    if (subscriberToEdit) {
      setFormData(subscriberToEdit);
      setEditingId(id);
      setActiveTab('add');
    }
  };

  const handleDelete = (id) => {
    setSubscribers(subscribers.filter(sub => sub.id !== id));
  };

  const handleViewDetails = (subscriber) => {
    setViewDetails(subscriber);
  };

  const closeDetails = () => setViewDetails(null);

  useEffect(() => {
    localStorage.setItem('subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  const filteredSubscribers = subscribers.filter(sub => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sub.userName.toLowerCase().includes(searchLower) || 
      (sub.referralId && sub.referralId.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="app-container">
      <div className="header-banner">
        <h1>
          <i className="fas fa-users" style={{ color: "white", marginRight: "10px" }}></i>
          Total Paid Subscribers List
        </h1>
        <p>Manage all your paid subscribers</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'add' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('add')}
        >
          <i className="fas fa-user-plus" style={{ color: "#ff5f15", marginRight: "6px" }}></i>
          Add Subscriber
        </button>
        <button
          className={activeTab === 'view' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('view')}
        >
          <i className="fas fa-address-book" style={{ color: "#ff5f15", marginRight: "6px" }}></i>
          View Subscribers
        </button>
      </div>
      
      {activeTab === 'add' && (
        <div className="subscriber-form">
          <h2>
            <i className="fas fa-user-plus" style={{ color: "#28a745", marginRight: "8px" }}></i>
            {editingId !== null ? 'Edit Subscriber' : 'Add New Subscriber'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group input-icon-group">
                <label><i className="fas fa-user"></i> User Name</label>
                <span className="input-icon"><i className="fas fa-user"></i></span>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-phone"></i> Phone Number</label>
                <span className="input-icon"><i className="fas fa-phone"></i></span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-envelope"></i> Email ID</label>
                <span className="input-icon"><i className="fas fa-envelope"></i></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-chart-line"></i> Trading View ID</label>
                <span className="input-icon"><i className="fas fa-chart-line"></i></span>
                <input
                  type="text"
                  name="tradingViewId"
                  value={formData.tradingViewId}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-list"></i> Plan</label>
                <span className="input-icon"><i className="fas fa-list"></i></span>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Plan --</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-rupee"></i> Pricing ($)</label>
                <span className="input-icon"><i className="fas fa-rupee-sign"></i></span>
                <input
                  type="number"
                  name="pricing"
                  value={formData.pricing}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group input-icon-group">
                <label>
                  <i className="fas fa-calendar-alt"></i> Start Date
                </label>
                <span className="input-icon">
                  <i className="fas fa-calendar-alt"></i>
                </span>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group input-icon-group">
                <label>
                  <i className="fas fa-calendar-check"></i> Expiry Date
                </label>
                <span className="input-icon">
                  <i className="fas fa-calendar-check"></i>
                </span>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  readOnly
                  className="read-only"
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-hourglass-half"></i> Remaining Days</label>
                <span className="input-icon"><i className="fas fa-hourglass-half"></i></span>
                <input
                  type="text"
                  name="remainingDays"
                  value={formData.remainingDays}
                  readOnly
                  className="read-only"
                />
              </div>
              <div className="form-group input-icon-group">
                <label><i className="fas fa-percent"></i> Commission (%)</label>
                <span className="input-icon"><i className="fas fa-percent"></i></span>
                <input
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                <i className={`fas ${editingId !== null ? 'fa-save' : 'fa-plus'}`}></i>
                &nbsp;{editingId !== null ? 'Update Subscriber' : 'Add Subscriber'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      userName: '',
                      phoneNumber: '',
                      email: '',
                      referralId: '',
                      tradingViewId: '',
                      plan: '',
                      pricing: '',
                      commission: '',
                      startDate: new Date().toISOString().split('T')[0],
                      expiryDate: ''
                    });
                  }}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              )}
            </div>
          </form>
          {successMsg && (
            <div className="success-message" style={{
              color: "#155724",
              padding: "10px 20px",
              borderRadius: "5px",
              margin: "15px 0",
              textAlign: "center",
              fontWeight: "bold",
              boxShadow: "0 2px 8px #0001"
            }}>
              <i className="fas fa-check-circle" style={{ color: "#28a745", marginRight: "8px" }}></i>
              {successMsg}
            </div>
          )}
        </div>
      )}

      {activeTab === 'view' && (
        <div className="subscriber-list">
          <h2>Total Paid Subscribers ({subscribers.length})</h2>
          
          <div className="search-bar" style={{ marginBottom: '20px'}}>
            <div className="input-icon-group" style={{ maxWidth: '400px'}}>
              <span className="input-icon"><i className="fas fa-search"></i></span>
              <input
                type="text"
                placeholder="Search by name or referral ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Serial No</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Referral ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber, idx) => (
                    <tr key={subscriber.id}>
                      <td>{idx + 1}</td>
                      <td>{subscriber.userName}</td>
                      <td>{subscriber.email}</td>
                      <td>{subscriber.referralId}</td>
                      <td className={`status-${subscriber.status}`}>
                        {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                      </td>
                      <td>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(subscriber)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          style={{ color: "red", marginLeft: "6px" }}
                          title="Delete"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this subscriber?")) {
                              handleDelete(subscriber.id);
                            }
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#888' }}>
                      {searchTerm ? 'No matching subscribers found' : 'No subscribers found. Add your first subscriber!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'view' && viewDetails && (
        <div className="details-modal">
          <div className="details-card">
            <h3>
              <i className="fas fa-id-card" style={{ color: "#6f42c1", marginRight: "8px" }}></i>
              Subscriber Details
            </h3>
            <button className="close-btn" onClick={closeDetails}>&times;</button>
            <ul>
              <li>
                <span className="modal-label">
                  <i className="fas fa-user" style={{ color: "#007bff", marginRight: "10px" }}></i> User Name:
                </span>
                <span className="modal-value">{viewDetails.userName}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-envelope" style={{ color: "#fd7e14", marginRight: "10px" }}></i> Email:
                </span>
                <span className="modal-value">{viewDetails.email}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-phone" style={{ color: "#20c997", marginRight: "10px" }}></i> Phone Number:
                </span>
                <span className="modal-value">{viewDetails.phoneNumber}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-user-friends" style={{ color: "#6f42c1", marginRight: "10px" }}></i> Referral ID:
                </span>
                <span className="modal-value">{viewDetails.referralId}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-chart-line" style={{ color: "#e83e8c", marginRight: "10px" }}></i> Trading View ID:
                </span>
                <span className="modal-value">{viewDetails.tradingViewId}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-list" style={{ color: "#17a2b8", marginRight: "10px" }}></i> Plan:
                </span>
                <span className="modal-value">{viewDetails.plan}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-rupee-sign" style={{ color: "#ffc107", marginRight: "10px" }}></i> Pricing:
                </span>
                <span className="modal-value">${viewDetails.pricing}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-calendar-alt" style={{ color: "#007bff" , marginRight: "10px" }}></i> Start Date:
                </span>
                <span className="modal-value">{viewDetails.startDate}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-calendar-check" style={{ color: "#28a745", marginRight: "10px" }}></i> Expiry Date:
                </span>
                <span className="modal-value">{viewDetails.expiryDate}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-hourglass-half" style={{ color: "#6c757d", marginRight: "10px" }}></i> Remaining Days:
                </span>
                <span className="modal-value">{viewDetails.remainingDays}</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-percent" style={{ color: "#fd7e14", marginRight: "10px" }}></i> Commission:
                </span>
                <span className="modal-value">{viewDetails.commission}%</span>
              </li>
              <li>
                <span className="modal-label">
                  <i className="fas fa-info-circle" style={{ color: "#6f42c1", marginRight: "10px" }}></i> Status:
                </span>
                <span className="modal-value">
                  <span className={`status-${viewDetails.status}`}>
                    {viewDetails.status.charAt(0).toUpperCase() + viewDetails.status.slice(1)}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;