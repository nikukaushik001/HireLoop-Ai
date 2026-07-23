import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { apiClient } from '../api/client';
import { Calendar, CheckCircle } from 'lucide-react';

export const InterviewSchedulePage = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const appId = searchParams.get('appId');
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [interviewerName, setInterviewerName] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !appId || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      await apiClient.post(`/jobs/${jobId}/applications/${appId}/interviews`, {
        scheduledAt,
        durationMinutes: Number(duration),
        interviewerName,
        meetingLink
      });
      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error?.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jobId || !appId) {
    return <div className="text-gradient">Missing Job ID or Application ID. Return to Job Details.</div>;
  }

  if (showSuccess) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <style>{`
          @keyframes slideUpFade {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <div className="glass-card" style={{ textAlign: 'center', padding: '64px', maxWidth: '500px' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px auto', border: '2px solid var(--accent-primary)',
            animation: 'slideUpFade 0.4s ease-out both'
          }}>
            <CheckCircle size={32} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', animation: 'slideUpFade 0.4s ease-out 0.1s both' }}>
            Interview Scheduled!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', animation: 'slideUpFade 0.4s ease-out 0.2s both' }}>
            The candidate has been notified via email with all the necessary details.
          </p>
          <button className="btn btn-primary" style={{ animation: 'slideUpFade 0.4s ease-out 0.3s both' }} onClick={() => navigate(`/jobs/${jobId}`)}>
            Back to Job Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '600px', marginTop: '32px' }}>
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }} className="text-gradient">
          <Calendar size={24} /> Schedule Interview
        </h2>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Date</label>
              <input type="date" className="input-field" required value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Time</label>
              <input type="time" className="input-field" required value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          
          <div className="input-group">
            <label>Duration (Minutes)</label>
            <input type="number" className="input-field" required value={duration} onChange={e => setDuration(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <label>Interviewer Name</label>
            <input type="text" className="input-field" required value={interviewerName} onChange={e => setInterviewerName(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Meeting Link (Optional)</label>
            <input type="url" className="input-field" placeholder="https://meet.google.com/..." value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule & Notify Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
