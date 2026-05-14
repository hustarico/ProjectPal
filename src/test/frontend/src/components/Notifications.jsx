import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as notificationsApi from '../api/notifications';

const TYPE_ICONS = {
  PROJECT_INVITATION: '📨',
  TASK_ASSIGNED: '📋',
  DEADLINE_REMINDER: '⏰',
  JOIN_REQUEST: '🚪',
  JOIN_APPROVED: '✅',
  JOIN_REJECTED: '❌',
  NEW_MESSAGE: '💬'
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetch = () =>
    notificationsApi.getMyNotifications()
      .then(res => setNotifications(res.data))
      .catch(() => {});

  useEffect(() => {
    fetch().finally(() => setLoading(false));
  }, []);

  const handleDismiss = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await notificationsApi.deleteAllNotifications();
      setNotifications([]);
    } catch {} finally {
      setClearing(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading notifications...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: 14 }}>
            {notifications.length} total
          </span>
          {notifications.length > 0 && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleClearAll}
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>No notifications yet.</p>
          </div>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(n => (
            <div
              key={n.id}
              className="notification-item"
              style={{ cursor: n.projectId ? 'pointer' : 'default' }}
              onClick={() => n.projectId && navigate(`/projects/${n.projectId}`)}
            >
              <div className="notification-icon">
                {TYPE_ICONS[n.type] || '🔔'}
              </div>
              <div className="notification-content">
                <p>{n.message}</p>
                {n.projectName && (
                  <p style={{ fontSize: 12, color: '#6366f1', marginTop: 2 }}>
                    Project: {n.projectName}
                  </p>
                )}
                <div className="notification-time">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={(e) => handleDismiss(n.id, e)}
                title="Dismiss"
                style={{ fontSize: 18, flexShrink: 0 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
