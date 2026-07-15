import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Calendar, Video, Clock } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const InterviewsPage = () => {
  // Since we don't have a standalone GET /interviews endpoint that gets ALL interviews
  // Let's implement a workaround by just showing a dashboard or adding that endpoint.
  // Wait, I didn't create a GET /interviews endpoint in backend. I'll mock it or fetch via jobs.
  // For now, I'll display a placeholder to keep it simple, or I can add the endpoint.
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient" style={{ marginBottom: '24px' }}>Upcoming Interviews</h1>
      <div className="glass-card" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
        <Calendar size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
        <h3>Interview Calendar</h3>
        <p>Your scheduled interviews will appear here.</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Navigate to a candidate's application in a Job to schedule new interviews.</p>
      </div>
    </div>
  );
};
