import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { MessageSquare, Star, CheckCircle, AlertCircle, Loader, ShieldCheck } from 'lucide-react';

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '8px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        size={28}
        style={{ color: n <= value ? '#f59e0b' : 'rgba(148,163,184,0.3)', cursor: 'pointer', fill: n <= value ? '#f59e0b' : 'none', transition: 'all 0.2s' }}
        onClick={() => onChange(n)}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      />
    ))}
  </div>
);

export const MagicFeedbackPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [rating, setRating] = useState(3);
  const [feedbackText, setFeedbackText] = useState('');
  const [recommendation, setRecommendation] = useState<'STRONG_HIRE' | 'HIRE' | 'NO_HIRE'>('HIRE');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Note: We use the public API route here (not authenticated)
    apiClient.get(`/interviews/magic/${id}`)
      .then(res => setDetails(res.data.data))
      .catch(err => setError(err?.response?.data?.error?.message || 'Invalid or expired magic link.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) { setError('Please provide feedback notes.'); return; }
    setSubmitting(true);
    try {
      await apiClient.post(`/interviews/magic/${id}/feedback`, { rating, feedbackText, recommendation });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to submit feedback.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0f1d' }}>
        <Loader size={32} className="animate-spin" style={{ color: '#6366f1', marginBottom: '16px' }} />
        <div style={{ color: '#94a3b8' }}>Verifying secure link...</div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0f1d' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '32px', borderRadius: '16px', color: '#ef4444', textAlign: 'center', maxWidth: '400px' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
          <h2 style={{ margin: '0 0 8px 0' }}>Link Invalid</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (success || (details && details.hasFeedback)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0f1d' }}>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '40px', borderRadius: '24px', color: '#10b981', textAlign: 'center', maxWidth: '400px' }}>
          <CheckCircle size={56} style={{ margin: '0 auto 20px' }} />
          <h2 style={{ margin: '0 0 12px 0', color: '#34d399' }}>Feedback Received!</h2>
          <p style={{ margin: 0, color: '#a7f3d0' }}>Thank you for submitting your interview feedback. It has been securely saved to the HR dashboard.</p>
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(16,185,129,0.2)', color: 'rgba(16,185,129,0.5)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Secured by HireLoop AI
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1d 0%, #111827 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '600px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ padding: '32px 40px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.02) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={16} color="#818cf8" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#818cf8', letterSpacing: '1px', textTransform: 'uppercase' }}>Secure External Feedback</span>
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#f8fafc', fontWeight: 800 }}>Interview Evaluation</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>
            You are evaluating <strong style={{ color: '#f1f5f9' }}>{details?.candidateName}</strong> for the <strong style={{ color: '#f1f5f9' }}>{details?.jobTitle}</strong> role.
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '40px' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Overall Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Hiring Recommendation</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {(['STRONG_HIRE', 'HIRE', 'NO_HIRE'] as const).map(r => (
                <button key={r} onClick={() => setRecommendation(r)} style={{
                  padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: '1px solid',
                  borderColor: recommendation === r ? (r === 'NO_HIRE' ? '#ef4444' : '#10b981') : 'rgba(255,255,255,0.05)',
                  background: recommendation === r ? (r === 'NO_HIRE' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)') : 'rgba(255,255,255,0.02)',
                  color: recommendation === r ? (r === 'NO_HIRE' ? '#ef4444' : '#10b981') : '#64748b',
                  transition: 'all 0.2s'
                }}>
                  {r === 'STRONG_HIRE' ? '🌟 Strong Hire' : r === 'HIRE' ? '✅ Hire' : '❌ No Hire'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Detailed Feedback & Notes</label>
            <textarea
              className="input-field"
              rows={5}
              placeholder="Provide specific feedback on the candidate's technical skills, communication, and culture fit..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              style={{ resize: 'vertical', minHeight: '120px', background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', fontSize: '14px', marginBottom: '24px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting} style={{
            width: '100%', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
            boxShadow: '0 8px 20px rgba(99,102,241,0.3)', transition: 'all 0.2s'
          }}>
            {submitting ? <><Loader size={18} className="animate-spin" /> Submitting securely...</> : <><CheckCircle size={18} /> Submit Interview Evaluation</>}
          </button>
        </div>
      </div>
    </div>
  );
};
