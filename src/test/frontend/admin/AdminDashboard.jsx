import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import * as adminApi from './admin';

export default function AdminDashboard() {
  const admin = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getAdminStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading dashboard...</div>;

  if (error) return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: '#6366f1' },
    { label: 'Active Users', value: stats.activeUsers, color: '#16a34a' },
    { label: 'Blocked Users', value: stats.blockedUsers, color: '#ef4444' },
    { label: 'Admins', value: stats.adminUsers, color: '#f59e0b' },
    { label: 'Active Projects', value: stats.activeProjects, color: '#3b82f6' },
    { label: 'Ended Projects', value: stats.endedProjects, color: '#64748b' },
    { label: 'Total Projects', value: stats.totalProjects, color: '#8b5cf6' },
    { label: 'Total Skills', value: stats.totalSkills, color: '#06b6d4' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {admin?.firstName || 'Admin'}</p>
        </div>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {cards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
