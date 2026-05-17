import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../src/styles.css';
import './admin.css';
import { IconDashboard, IconUsers, IconFolder, IconStar, IconArrowLeft, IconLogout } from '../src/components/Icons';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    if (!token || !userStr) {
      navigate('/admin/login', { replace: true });
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'ADMIN') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login', { replace: true });
        return;
      }
      setAdmin(user);
    } catch {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      navigate('/admin/login', { replace: true });
      return;
    }
    setChecked(true);
  }, [navigate]);

  const handleLogout = () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  };

  if (!checked) {
    return <div className="loading-screen"><div className="loading-spinner"></div>Loading...</div>;
  }

  const initials = admin
    ? `${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="sidebar-logo">P</div>
          <div>
            <h1>ProjectPal</h1>
            <p>Admin Panel</p>
          </div>
        </div>
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon"><IconDashboard /></span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon"><IconUsers /></span>
            <span>Users</span>
          </NavLink>
          <NavLink to="/admin/projects" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon"><IconFolder /></span>
            <span>Projects</span>
          </NavLink>
          <NavLink to="/admin/skills" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon"><IconStar /></span>
            <span>Skills</span>
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>
            <span className="nav-icon"><IconArrowLeft /></span>
            <span>Back to App</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <span className="nav-icon"><IconLogout /></span>
            <span>Sign Out</span>
          </a>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet context={admin} />
      </main>
    </div>
  );
}
