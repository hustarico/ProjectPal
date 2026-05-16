import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as notificationsApi from '../api/notifications';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await notificationsApi.getMyNotifications();
        setNotifCount(res.data.length);
      } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  const avatarUrl = user?.profilePictureUrl
    ? `http://localhost:8080${user.profilePictureUrl}`
    : null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">P</div>
        <span className="sidebar-brand-text">ProjectPal</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className="sidebar-nav-item">
          <span className="sidebar-nav-icon">&#9632;</span>
          <span className="sidebar-nav-label">Dashboard</span>
        </NavLink>
        <NavLink to="/browse" className="sidebar-nav-item">
          <span className="sidebar-nav-icon">&#9776;</span>
          <span className="sidebar-nav-label">Browse</span>
        </NavLink>
        <NavLink to="/projects/new" className="sidebar-nav-item">
          <span className="sidebar-nav-icon">&#43;</span>
          <span className="sidebar-nav-label">New Project</span>
        </NavLink>
        <NavLink to="/search" className="sidebar-nav-item">
          <span className="sidebar-nav-icon">&#128269;</span>
          <span className="sidebar-nav-label">Search</span>
        </NavLink>
        <NavLink to="/past-projects" className="sidebar-nav-item">
          <span className="sidebar-nav-icon">&#9203;</span>
          <span className="sidebar-nav-label">Past Projects</span>
        </NavLink>
        <NavLink to="/notifications" className="sidebar-nav-item">
          <span className="sidebar-nav-icon">&#128276;</span>
          <span className="sidebar-nav-label">Notifications</span>
          {notifCount > 0 && <span className="sidebar-nav-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-user">
          <div className="sidebar-user-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
        </Link>
        <div className="sidebar-actions">
          <button className="sidebar-action-btn" onClick={toggle} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '&#9790;' : '&#9788;'}
          </button>
          <button className="sidebar-action-btn" onClick={handleLogout} title="Logout">
            &#9094;
          </button>
        </div>
      </div>
    </aside>
  );
}
