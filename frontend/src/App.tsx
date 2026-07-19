import React from 'react';
import { Routes, Route } from 'react-router';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { ResumesPage } from './pages/ResumesPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { InterviewSchedulePage } from './pages/InterviewSchedulePage';
import { RegisterPage } from './pages/RegisterPage';
import { RankingPage } from './pages/RankingPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { LandingPage } from './pages/LandingPage';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<LandingPage />} />
      
      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidateDetailPage />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/interviews/schedule" element={<InterviewSchedulePage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
