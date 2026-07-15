import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Briefcase, Users, FileText, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Candidates', path: '/candidates', icon: <Users size={20} /> },
    { name: 'Resumes', path: '/resumes', icon: <FileText size={20} /> },
    { name: 'Interviews', path: '/interviews', icon: <Calendar size={20} /> },
  ];

  return (
    <aside style={{
      width: '260px',
      borderRight: '1px solid var(--glass-border)',
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }} className="text-gradient">HireLoop-AI</h1>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Intelligent ATS</div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              transition: 'all 0.2s'
            })}
          >
            <span style={{ color: 'var(--accent-primary)' }}>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name || user?.email}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="btn btn-secondary" 
          style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};
