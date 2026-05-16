import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import BrowseProjects from './components/BrowseProjects';
import CreateProject from './components/CreateProject';
import ProjectDetail from './components/ProjectDetail';
import Notifications from './components/Notifications';
import Search from './components/Search';
import UserDetail from './components/UserDetail';
import PastProjects from './components/PastProjects';
import AdminLogin from '../admin/AdminLogin';
import AdminLayout from '../admin/AdminLayout';
import AdminDashboard from '../admin/AdminDashboard';
import AdminUsers from '../admin/AdminUsers';
import AdminProjects from '../admin/AdminProjects';
import AdminSkills from '../admin/AdminSkills';

function ProtectedLayout() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/browse" element={<BrowseProjects />} />
        <Route path="/projects/new" element={<CreateProject />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/search" element={<Search />} />
        <Route path="/users/:userId" element={<UserDetail />} />
        <Route path="/past-projects" element={<PastProjects />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="skills" element={<AdminSkills />} />
      </Route>
    </Routes>
  );
}
