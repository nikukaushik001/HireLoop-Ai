import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const AdminLayout: React.FC = () => {
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

  if (user.role !== 'SUPERADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="layout-container animate-fade-in">
      <AdminSidebar />
      <main className="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
