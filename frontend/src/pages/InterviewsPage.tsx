import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Calendar, Video, Clock, User, Briefcase, Star, CheckCircle, AlertCircle, ChevronDown, ChevronUp, MessageSquare, Loader } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

interface Interview {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  interviewerName: string;
  status: string;
  rating?: number;
  feedbackText?: string;
  recommendation?: string;
  application: {
    id: string;
    candidate: { id: string; name: string; email: string };
    job: { id: string; title: string; department: string };
  };
}

const RecommendationBadge: React.FC<{ rec: string }> = ({ rec }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    STRONG_HIRE: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    HIRE: { bg: 'rgba(99,102,241,0.15)', color: '#6366f1' },
    NO_HIRE: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  };
  const style = colors[rec] || { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' };
  const labels: Record<string, string> = { STRONG_HIRE: '🌟 Strong Hire', HIRE: '✅ Hire', NO_HIRE: '❌ No Hire' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
      background: style.bg, color: style.color, border: `1px solid ${style.color}44`
    }}>
      {labels[rec] || rec}
    </span>
  );
};

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({ value, onChange, readonly }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        size={18}
        style={{ color: n <= value ? '#f59e0b' : 'rgba(148,163,184,0.3)', cursor: readonly ? 'default' : 'pointer', fill: n <= value ? '#f59e0b' : 'none' }}
        onClick={() => !readonly && onChange && onChange(n)}
      />
    ))}
  </div>
);

const FeedbackModal: React.FC<{
  interviewId: string;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
}> = ({ interviewId, candidateName, jobTitle, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(3);
  const [feedbackText, setFeedbackText] = useState('');
  const [recommendation, setRecommendation] = useState<'STRONG_HIRE' | 'HIRE' | 'NO_HIRE'>('HIRE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!feedbackText.trim()) { setError('Please add feedback text.'); return; }
    setSubmitting(true);
    try {
      await apiClient.patch(`/interviews/${interviewId}/feedback`, { rating, feedbackText, recommendation });
      onSubmitted();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to submit feedback.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
        borderRadius: '20px', padding: '32px', width: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <MessageSquare size={22} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Submit Interview Feedback</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          {candidateName} — <strong style={{ color: 'var(--text-secondary)' }}>{jobTitle}</strong>
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Recommendation</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {(['STRONG_HIRE', 'HIRE', 'NO_HIRE'] as const).map(r => (
              <button key={r} onClick={() => setRecommendation(r)} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                borderColor: recommendation === r ? 'var(--accent-primary)' : 'var(--glass-border)',
                background: recommendation === r ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: recommendation === r ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}>
                {r === 'STRONG_HIRE' ? '🌟 Strong Hire' : r === 'HIRE' ? '✅ Hire' : '❌ No Hire'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Feedback Notes</label>
          <textarea
            className="input-field"
            rows={4}
            placeholder="Describe the candidate's performance, strengths, and areas of improvement..."
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            style={{ resize: 'vertical', minHeight: '100px' }}
          />
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ gap: '6px' }}>
            {submitting ? <><Loader size={14} className="animate-spin" /> Submitting...</> : <><CheckCircle size={14} /> Submit & Notify Candidate</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const InterviewCard: React.FC<{ interview: Interview; onRefresh: () => void }> = ({ interview, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const scheduledDate = new Date(interview.scheduledAt);
  const isPast = scheduledDate < new Date();
  const statusColor = interview.status === 'COMPLETED' ? '#10b981' : interview.status === 'CANCELLED' ? '#ef4444' : '#6366f1';

  return (
    <>
      <div style={{
        background: 'rgba(15,18,35,0.8)', border: `1px solid ${statusColor}22`,
        borderRadius: '14px', padding: '20px 24px', backdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
      }}>
        <div className="interview-card-layout" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Calendar Icon */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
            background: `linear-gradient(135deg, ${statusColor}22, ${statusColor}08)`,
            border: `1px solid ${statusColor}33`, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, lineHeight: 1 }}>
              {scheduledDate.toLocaleDateString('en', { month: 'short' })}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: statusColor, lineHeight: 1 }}>
              {scheduledDate.getDate()}
            </span>
          </div>

          {/* Info */}
          <div className="interview-card-info" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                {interview.application.candidate.name}
              </span>
              <StatusBadge status={interview.status} />
              {interview.recommendation && <RecommendationBadge rec={interview.recommendation} />}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={11} /> {interview.application.job.title}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={11} /> Interviewer: {interview.interviewerName}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.durationMinutes}min)
              </span>
            </div>

            {/* Rating if feedback submitted */}
            {interview.rating && (
              <div style={{ marginTop: '8px' }}>
                <StarRating value={interview.rating} readonly />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="interview-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {interview.status === 'SCHEDULED' && (
              <button 
                onClick={() => {
                  const link = `${window.location.origin}/feedback/${interview.id}`;
                  navigator.clipboard.writeText(link);
                  alert('Magic feedback link copied to clipboard! Send this to the external interviewer.');
                }}
                className="btn" 
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                  borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(16,185,129,0.15)', color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)'
                }}
              >
                <MessageSquare size={13} /> Copy Link
              </button>
            )}
            {interview.meetingLink && interview.status === 'SCHEDULED' && (
              <a href={interview.meetingLink} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                borderRadius: '8px', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)',
                border: '1px solid rgba(99,102,241,0.3)'
              }}>
                <Video size={13} /> Join
              </a>
            )}
            {interview.status === 'SCHEDULED' && isPast && (
              <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', gap: '6px' }}
                onClick={() => setShowFeedbackModal(true)}>
                <MessageSquare size={13} /> Give Feedback
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', padding: '4px'
            }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded: Feedback details */}
        {expanded && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Candidate Email</div>
                <div style={{ color: 'var(--text-secondary)' }}>{interview.application.candidate.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Department</div>
                <div style={{ color: 'var(--text-secondary)' }}>{interview.application.job.department || 'N/A'}</div>
              </div>
              {interview.feedbackText && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MessageSquare size={11} /> Feedback Notes
                  </div>
                  <div style={{
                    color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '13px',
                    background: 'rgba(99,102,241,0.06)', borderRadius: '8px', padding: '10px 14px',
                    border: '1px solid rgba(99,102,241,0.12)'
                  }}>
                    {interview.feedbackText}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          interviewId={interview.id}
          candidateName={interview.application.candidate.name}
          jobTitle={interview.application.job.title}
          onClose={() => setShowFeedbackModal(false)}
          onSubmitted={() => { setShowFeedbackModal(false); onRefresh(); }}
        />
      )}
    </>
  );
};

export const InterviewsPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/interviews');
      setInterviews(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterviews(); }, []);

  const filtered = filter === 'ALL' ? interviews : interviews.filter(i => i.status === filter);

  const counts = {
    ALL: interviews.length,
    SCHEDULED: interviews.filter(i => i.status === 'SCHEDULED').length,
    COMPLETED: interviews.filter(i => i.status === 'COMPLETED').length,
    CANCELLED: interviews.filter(i => i.status === 'CANCELLED').length,
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '10px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)'
          }}>
            <Calendar size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 className="text-gradient" style={{ margin: 0 }}>Interview Calendar</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
          Track all scheduled interviews, submit feedback, and notify candidates of their results.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
        {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map(f => {
          const colors: Record<string, string> = { ALL: '#6366f1', SCHEDULED: '#3b82f6', COMPLETED: '#10b981', CANCELLED: '#ef4444' };
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', border: `1px solid ${isActive ? colors[f] + '66' : 'var(--glass-border)'}`,
                background: isActive ? `${colors[f]}18` : 'transparent',
                color: isActive ? colors[f] : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              {f} <span style={{
                background: isActive ? colors[f] + '33' : 'rgba(255,255,255,0.05)',
                color: isActive ? colors[f] : 'var(--text-muted)',
                padding: '1px 6px', borderRadius: '99px', fontSize: '10px', fontWeight: 700
              }}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-muted)', gap: '12px' }}>
          <Loader size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
          <span>Loading interviews...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {filter === 'ALL' ? 'No Interviews Yet' : `No ${filter.charAt(0) + filter.slice(1).toLowerCase()} Interviews`}
          </h3>
          <p style={{ fontSize: '13px', marginTop: '4px', lineHeight: 1.6 }}>
            {filter === 'ALL'
              ? 'Shortlist candidates from the Jobs page, then schedule interviews from the candidate application.'
              : `Switch to "All" to see all interviews.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(interview => (
            <InterviewCard key={interview.id} interview={interview} onRefresh={fetchInterviews} />
          ))}
        </div>
      )}
    </div>
  );
};
