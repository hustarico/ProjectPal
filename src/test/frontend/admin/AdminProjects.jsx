import { useState, useEffect } from 'react';
import * as adminApi from './admin';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await adminApi.getAdminProjects();
      setProjects(res.data);
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleToggleStatus = async (projectId) => {
    setActionLoading(projectId);
    setMessage('');
    try {
      const res = await adminApi.toggleProjectStatus(projectId);
      setProjects(prev => prev.map(p => p.id === projectId ? res.data : p));
      setMessage(res.data.isDeleted ? 'Project has been ended (soft-deleted).' : 'Project has been restored.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update project status.');
    } finally {
      setActionLoading(null);
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'in_progress';
      case 'COMPLETED': return 'completed';
      default: return '';
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage all projects</p>
        </div>
      </div>
      {message && (
        <div className={message.includes('Failed') ? 'error-message' : 'success-message'}>
          {message}
          <button className="message-dismiss" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}
      {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}
      <div className="admin-card">
        <div className="card-body">
          {projects.length === 0 ? (
            <div className="empty-state"><p>No projects found.</p></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Members</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id}>
                    <td>
                      <div className="user-name">{project.name}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: '#64748b' }}>
                        {project.ownerName}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClass(project.status)}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{project.memberCount}</td>
                    <td>
                      <span className="status-indicator">
                        <span className={`status-dot ${project.isDeleted ? 'ended' : 'active'}`} />
                        {project.isDeleted ? 'Ended' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${project.isDeleted ? 'btn-primary' : 'btn-danger'}`}
                        onClick={() => handleToggleStatus(project.id)}
                        disabled={actionLoading === project.id}
                      >
                        {actionLoading === project.id ? '...' : project.isDeleted ? 'Restore' : 'End'}
                      </button>
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
