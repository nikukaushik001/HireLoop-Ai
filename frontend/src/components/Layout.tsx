import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const Layout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
        <Logo size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'SUPERADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="layout-container animate-fade-in">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
