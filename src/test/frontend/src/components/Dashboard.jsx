import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as projectsApi from '../api/projects';
import * as notificationsApi from '../api/notifications';
import * as invitationsApi from '../api/invitations';
import { IconPlus, IconFileText, IconBell } from './Icons';

export default function Dashboard() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, notifRes, inviteRes] = await Promise.all([
        projectsApi.getMyProjects(),
        notificationsApi.getMyNotifications(),
        invitationsApi.getMyInvites()
      ]);
      setProjects(projRes.data);
      setNotifications(notifRes.data.slice(0, 5));
      setPendingInvites(inviteRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRespond = async (invitationId, accept) => {
    try {
      await invitationsApi.respondToInvitation(invitationId, accept);
      if (accept) {
        setMessage('Invitation accepted! You are now a member.');
        await fetchData();
        await refreshUser();
      } else {
        setMessage('Invitation declined.');
        setPendingInvites(prev => prev.filter(i => i.id !== invitationId));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to respond.');
    }
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    open: projects.filter(p => p.status === 'OPEN').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length
  };

  const statusClass = (status) => {
    switch (status) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'in_progress';
      case 'COMPLETED': return 'completed';
      default: return '';
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.firstName || 'User'}</h1>
          <p>Here&apos;s an overview of your projects and activity</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            <IconPlus size={16} /> New Project
          </button>
        </div>
      </div>

      {message && (
        <div className={message.includes('accepted') || message.includes('sent') ? 'success-message' : 'error-message'}>
          {message}
          <button className="message-dismiss" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="invite-banner">
          <h3>Pending Invitations ({pendingInvites.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingInvites.map(invite => (
              <div key={invite.id} className="search-result-item" style={{ background: 'transparent', border: 'none', padding: '10px 0' }}>
                <div className="result-info">
                  <h4>{invite.projectName}</h4>
                  <p>Invited by: {invite.senderName}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-primary" onClick={() => handleRespond(invite.id, true)}>Accept</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleRespond(invite.id, false)}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="two-col">
        <div>
          <div className="card">
            <div className="card-header">
              <h2>My Projects</h2>
              <button className="btn btn-sm btn-primary" onClick={() => navigate('/projects/new')}>
                <IconPlus size={14} /> New
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><IconFileText /></div>
                <p>No projects yet. Create your first project!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="search-result-item clickable"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="result-info">
                      <h4>{project.name}</h4>
                      <p>{project.description ? project.description.slice(0, 80) + (project.description.length > 80 ? '...' : '') : 'No description'}</p>
                    </div>
                    <span className={`status-badge ${statusClass(project.status)}`}>
                      {project.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h2>Recent Notifications</h2>
              {notifications.length > 0 && (
                <button className="btn btn-sm btn-ghost" onClick={() => navigate('/notifications')}>
                  View All &rarr;
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><IconBell /></div>
                <p>No notifications yet.</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.projectId ? 'clickable' : ''}`}
                    onClick={() => n.projectId && navigate(`/projects/${n.projectId}`)}
                  >
                    <div className="notification-icon">&#128276;</div>
                    <div className="notification-content">
                      <p>{n.message}</p>
                      <div className="notification-time">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
