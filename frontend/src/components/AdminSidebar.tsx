import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { ShieldAlert, Users, Database, LogOut, Hexagon, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'System Overview', path: '/admin', icon: <BarChart2 size={20} /> },
  ];

  return (
    <aside style={{
      width: '280px',
      borderRight: '1px solid var(--glass-border)',
      background: 'rgba(3, 7, 18, 0.6)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
      zIndex: 10,
      position: 'relative'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
        }}>
          <ShieldAlert size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 700 }} className="text-gradient">Super<span style={{color: 'white'}}>Admin</span></h1>
          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Control Panel</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className="group"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              borderLeft: isActive ? '3px solid #ef4444' : '3px solid transparent',
              boxShadow: isActive ? 'inset 0 0 20px rgba(239, 68, 68, 0.05)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '40px', height: '100%',
                    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), transparent)', zIndex: 0
                  }} />
                )}
                <span style={{ 
                  color: isActive ? '#ef4444' : 'var(--text-muted)',
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
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', fontSize: '18px', color: 'white',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role}</div>
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
    </aside>
  );
};
