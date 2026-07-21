import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Briefcase, Users, FileText, Calendar, LogOut, Hexagon, Brain, TrendingUp, Zap, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Action Center', path: '/action-center', icon: <Zap size={20} /> },
    { name: 'Candidates', path: '/candidates', icon: <Users size={20} /> },
    { name: 'Resumes', path: '/resumes', icon: <FileText size={20} /> },
    { name: 'Ranking', path: '/ranking', icon: <TrendingUp size={20} /> },
    { name: 'Interviews', path: '/interviews', icon: <Calendar size={20} /> },
  ];

  return (
    <aside style={{
      width: '280px',
      borderRight: '1px solid var(--glass-border)',
      background: 'rgba(3, 7, 18, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
      zIndex: 10,
      position: 'relative'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, width: '28px', height: '28px', alignItems: 'center', justifyContent: 'center' }}
        >
          {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-emerald))',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Brain size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 700 }} className="text-gradient">HireLoop<span style={{color: 'white'}}>.ai</span></h1>
            <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Intelligent ATS</div>
          </div>
        </div>

        {/* Mobile Spacer to perfectly center the logo via space-between */}
        <div className="mobile-menu-btn" style={{ width: '28px', visibility: 'hidden' }}></div>
      </div>

      <div className={`sidebar-nav-container ${isMobileOpen ? 'open' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="group"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              boxShadow: isActive ? 'inset 0 0 20px rgba(99,102,241,0.05)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '40px', height: '100%',
                    background: 'linear-gradient(90deg, rgba(99,102,241,0.2), transparent)', zIndex: 0
                  }} />
                )}
                <span style={{ 
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  transition: 'color 0.3s',
                  position: 'relative', zIndex: 1
                }}>
                  {item.icon}
                </span>
                <span style={{ position: 'relative', zIndex: 1 }}>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', margin: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-emerald))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', fontSize: '18px', color: 'white',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || user?.email}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role || 'Administrator'}</div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="btn btn-secondary" 
          style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', color: 'var(--accent-rose)' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
      </div>
    </aside>
  );
};
