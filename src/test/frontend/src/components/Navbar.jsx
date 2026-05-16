import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as notificationsApi from '../api/notifications';

export default function Navbar() {
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
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">ProjectPal</Link>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/browse">Browse</NavLink>
        <NavLink to="/projects/new">New Project</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/past-projects">Past Projects</NavLink>
      </div>
      <div className="navbar-right">
        <button className="btn-icon theme-toggle" onClick={toggle} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <Link to="/notifications" className="notification-badge btn-icon">
          🔔
          {notifCount > 0 && <span className="badge">{notifCount > 9 ? '9+' : notifCount}</span>}
        </Link>
        <div className="navbar-user">
          <Link to="/profile" className="navbar-user-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
          </Link>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
