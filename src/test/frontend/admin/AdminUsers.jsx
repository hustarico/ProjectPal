import { useState, useEffect } from 'react';
import * as adminApi from './admin';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getAdminUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (userId) => {
    setActionLoading(`status-${userId}`);
    setMessage('');
    try {
      const res = await adminApi.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
      setMessage(res.data.isActive ? 'User has been unblocked.' : 'User has been blocked.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async (userId) => {
    setActionLoading(`promote-${userId}`);
    setMessage('');
    try {
      const res = await adminApi.promoteToAdmin(userId);
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
      setMessage('User has been promoted to admin.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to promote user.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage all registered users</p>
        </div>
      </div>
      {message && (
        <div className={message.includes('Failed') || message.includes('denied') ? 'error-message' : 'success-message'}>
          {message}
          <button className="message-dismiss" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}
      {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}
      <div className="admin-card">
        <div className="card-body">
          {users.length === 0 ? (
            <div className="empty-state"><p>No users found.</p></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Projects</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt="" />
                          ) : (
                            (user.firstName?.[0] || user.email[0]).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="user-name">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
                          </div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className="status-indicator">
                        <span className={`status-dot ${user.isActive ? 'active' : 'blocked'}`} />
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>{user.projectCount}</td>
                    <td>
                      <div className="action-btns">
                        {user.role !== 'ADMIN' && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handlePromote(user.id)}
                            disabled={actionLoading === `promote-${user.id}`}
                          >
                            {actionLoading === `promote-${user.id}` ? '...' : 'Promote'}
                          </button>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button
                            className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={actionLoading === `status-${user.id}`}
                          >
                            {actionLoading === `status-${user.id}` ? '...' : user.isActive ? 'Block' : 'Unblock'}
                          </button>
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
