import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { apiClient } from '../api/client';
import { Calendar } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !appId) return;

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      await apiClient.post(`/jobs/${jobId}/applications/${appId}/interviews`, {
        scheduledAt,
        durationMinutes: Number(duration),
        interviewerName,
        meetingLink
      });
      // Fake toast/email notification simulation
      alert(`Interview scheduled! An email notification would be sent to the candidate.`);
      navigate(`/jobs/${jobId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to schedule interview');
    }
  };

  if (!jobId || !appId) {
    return <div className="text-gradient">Missing Job ID or Application ID. Return to Job Details.</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '600px', marginTop: '32px' }}>
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }} className="text-gradient">
          <Calendar size={24} /> Schedule Interview
        </h2>
        
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
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule & Notify Candidate</button>
          </div>
        </form>
      </div>
    </div>
  );
};
