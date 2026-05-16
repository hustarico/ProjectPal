import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as notificationsApi from '../api/notifications';

const TYPE_ICONS = {
  PROJECT_INVITATION: '\u{1F4E8}',
  TASK_ASSIGNED: '\u{1F4CB}',
  DEADLINE_REMINDER: '\u23F0',
  JOIN_REQUEST: '\u{1F6AA}',
  JOIN_APPROVED: '\u2705',
  JOIN_REJECTED: '\u274C',
  NEW_MESSAGE: '\u{1F4AC}'
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

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading notifications...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-header-actions">
          {notifications.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
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
            <div className="empty-state-icon">&#128276;</div>
            <p>No notifications yet. You&apos;ll see updates about your projects here.</p>
          </div>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${n.projectId ? 'clickable' : ''}`}
              onClick={() => n.projectId && navigate(`/projects/${n.projectId}`)}
            >
              <div className="notification-icon">
                {TYPE_ICONS[n.type] || '\u{1F514}'}
              </div>
              <div className="notification-content">
                <p>{n.message}</p>
                {n.projectName && (
                  <div className="notification-project">
                    {n.projectName}
                  </div>
                )}
                <div className="notification-time">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={(e) => handleDismiss(n.id, e)}
                title="Dismiss"
                style={{ fontSize: 20, flexShrink: 0 }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
