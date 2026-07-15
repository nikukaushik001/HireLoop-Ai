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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidateDetailPage />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/interviews/schedule" element={<InterviewSchedulePage />} />
      </Route>
    </Routes>
  );
}

export default App;
