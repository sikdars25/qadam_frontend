import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data.users);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/admin/users/${userId}/toggle-active`
      );
      
      if (response.data.success) {
        setSuccess(response.data.message);
        fetchUsers(); // Refresh list
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/users/${userId}`
      );
      
      if (response.data.success) {
        setSuccess(response.data.message);
        fetchUsers(); // Refresh list
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <h1>👨‍💼 Admin Dashboard</h1>
            <p>User Management System</p>
          </div>
          <div className="admin-user-info">
            <span className="admin-badge">ADMIN</span>
            <span className="admin-name">{user.full_name}</span>
            <button onClick={onLogout} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{users.filter(u => u.is_active).length}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏸️</div>
            <div className="stat-info">
              <h3>{users.filter(u => !u.is_active).length}</h3>
              <p>Inactive Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍💼</div>
            <div className="stat-info">
              <h3>{users.filter(u => u.is_admin).length}</h3>
              <p>Admins</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {/* Users Table */}
        <div className="users-table-container">
          <h2>All Users</h2>
          
          {loading ? (
            <div className="admin-loading">Loading users...</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={!u.is_active ? 'inactive-user' : ''}>
                    <td>{u.id}</td>
                    <td>
                      <strong>{u.username}</strong>
                    </td>
                    <td>{u.full_name}</td>
                    <td>{u.email || 'N/A'}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                        {u.is_active ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </td>
                    <td>
                      {u.is_admin ? (
                        <span className="role-badge admin">👨‍💼 Admin</span>
                      ) : (
                        <span className="role-badge user">👤 User</span>
                      )}
                    </td>
                    <td className="date-cell">{formatDate(u.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        {!u.is_admin && (
                          <>
                            <button
                              onClick={() => toggleUserStatus(u.id, u.is_active)}
                              className={`action-btn ${u.is_active ? 'deactivate' : 'activate'}`}
                              title={u.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {u.is_active ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id, u.username)}
                              className="action-btn delete"
                              title="Delete User"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        {u.is_admin && (
                          <span className="protected-badge">🔒 Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
