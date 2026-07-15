import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Brain, UserCheck, Calendar as CalendarIcon, XCircle, CheckCircle } from 'lucide-react';

interface Application {
  id: string;
  candidateId: string;
  candidate: { name: string; email: string; skills: string[] };
  aiScore: number;
  aiReasoning: string;
  status: string;
  appliedAt: string;
}

interface JobDetail {
  id: string;
  title: string;
  description: string;
  requirements: string;
  department: string;
  status: string;
  applications: Application[];
}

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await apiClient.get(`/jobs/${id}`);
      setJob(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleRankCandidates = async () => {
    setRanking(true);
    try {
      await apiClient.get(`/jobs/${id}/rank`);
      await fetchJob(); // Re-fetch to get new scores
    } catch (err) {
      console.error(err);
    } finally {
      setRanking(false);
    }
  };

  const updateAppStatus = async (appId: string, status: string) => {
    try {
      await apiClient.patch(`/jobs/${id}/applications/${appId}/status`, { status });
      await fetchJob();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="animate-fade-in text-gradient" style={{ fontSize: '20px' }}>Loading Job Details...</div>;
  if (!job) return <div>Job not found</div>;

  // Sort applications by AI score descending
  const sortedApps = [...job.applications].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/jobs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>{job.title}</h1>
              <StatusBadge status={job.status} />
            </div>
            <div style={{ color: 'var(--text-muted)' }}>{job.department}</div>
          </div>
          <button className="btn btn-primary" onClick={handleRankCandidates} disabled={ranking}>
            <Brain size={16} /> {ranking ? 'Ranking...' : 'Rank Candidates with AI'}
          </button>
        </div>
        <div style={{ marginTop: '24px', display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</h4>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{job.description}</p>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Requirements</h4>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{job.requirements || 'No specific requirements listed.'}</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '16px' }} className="text-gradient">Applications & Recommendations</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedApps.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No applications yet. Upload resumes to get started.</div>
        ) : (
          sortedApps.map(app => (
            <div key={app.id} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ flex: '0 0 auto', textAlign: 'center', width: '80px' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  color: app.aiScore > 70 ? 'var(--accent-emerald)' : (app.aiScore > 40 ? 'var(--accent-amber)' : 'var(--text-muted)') 
                }}>
                  {app.aiScore || 0}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Match</div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => navigate(`/candidates/${app.candidateId}`)}>
                    {app.candidate.name}
                  </h3>
                  <StatusBadge status={app.status} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{app.candidate.email}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {app.candidate.skills.slice(0, 5).map(skill => (
                    <span key={skill} className="badge badge-indigo">{skill}</span>
                  ))}
                  {app.candidate.skills.length > 5 && <span className="badge" style={{ background: 'var(--glass-border)' }}>+{app.candidate.skills.length - 5} more</span>}
                </div>
              </div>

              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {app.status === 'NEW' && (
                  <>
                    <button className="btn btn-secondary" style={{ color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.2)' }} onClick={() => updateAppStatus(app.id, 'SHORTLISTED')}>
                      <CheckCircle size={16} /> Shortlist
                    </button>
                    <button className="btn btn-secondary" style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => updateAppStatus(app.id, 'REJECTED')}>
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}
                {app.status === 'SHORTLISTED' && (
                  <button className="btn btn-primary" onClick={() => navigate(`/interviews/schedule?jobId=${id}&appId=${app.id}`)}>
                    <CalendarIcon size={16} /> Schedule Interview
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
