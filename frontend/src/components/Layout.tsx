import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
        <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading HireLoop...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
