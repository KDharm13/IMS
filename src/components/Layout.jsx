import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Briefcase, FileText, CheckSquare, Users, Settings } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null; // Safe guard to prevent white screen crashes during logout

  const getNavLinks = () => {
    if (user.role === 'student') return [
      { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/student/internships', label: 'Browse Internships', icon: Briefcase },
      { path: '/student/applications', label: 'My Applications', icon: FileText },
      { path: '/student/reports', label: 'Submit Reports', icon: CheckSquare },
    ];
    if (user.role === 'company') return [
      { path: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/company/postings', label: 'Manage Postings', icon: Briefcase },
      { path: '/company/applications', label: 'Review Applicants', icon: Users },
      { path: '/company/certificates', label: 'Certificates', icon: FileText },
    ];
    if (user.role === 'admin') return [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/approvals', label: 'Approve Internships', icon: CheckSquare },
      { path: '/admin/users', label: 'Manage Users', icon: Users },
      { path: '/admin/reports', label: 'System Reports', icon: FileText },
    ];
    return [];
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <Briefcase size={28} color="var(--primary)" />
          <span style={{ fontSize: '1.1rem' }}>InternSYS</span>
        </div>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role} Panel</p>
        </div>
        <div className="nav-links">
          {getNavLinks().map(({ path, label, icon: Icon }) => (
            <Link 
              key={path} 
              to={path} 
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
        </div>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} className="btn btn-secondary" style={{ width: '100%' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
