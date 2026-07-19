import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import {
  Briefcase, Users, FileText, Calendar,
  ArrowRight, Plus, Upload, TrendingUp,
  Zap, Activity
} from 'lucide-react';

interface Stats {
  totalJobs: number;
  totalCandidates: number;
  totalResumes: number;
  upcomingInterviews: number;
}

const StatCard = ({ title, value, icon, color, sub }: { title: string; value: number; icon: React.ReactNode; color: string; sub: string }) => (
  <div style={{
    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden',
    transition: 'all 0.3s', cursor: 'default'
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
  >
    {/* Glow */}
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: `${color}18`, filter: 'blur(20px)' }}></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.45)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>TOTAL</div>
    </div>
    <div style={{ fontSize: '40px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-1px', lineHeight: 1, marginBottom: '8px' }}>{value}</div>
    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(148,163,184,0.8)' }}>{title}</div>
    <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.4)', marginTop: '4px' }}>{sub}</div>
  </div>
);

const QuickAction = ({ icon, label, sub, color, onClick }: { icon: React.ReactNode; label: string; sub: string; color: string; onClick: () => void }) => (
  <button onClick={onClick} style={{
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
    cursor: 'pointer', width: '100%', transition: 'all 0.25s', textAlign: 'left', fontFamily: "'Inter', sans-serif"
  }}
    onMouseEnter={e => { const el = e.currentTarget; el.style.background = `${color}0d`; el.style.borderColor = `${color}30`; el.style.transform = 'translateX(4px)'; }}
    onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.02)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateX(0)'; }}
  >
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.5)' }}>{sub}</div>
    </div>
    <ArrowRight size={16} style={{ color: 'rgba(148,163,184,0.3)' }} />
  </button>
);

export const DashboardPage = () => {
  const [stats, setStats] = useState<Stats>({ totalJobs: 0, totalCandidates: 0, totalResumes: 0, upcomingInterviews: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);


  const getDisplayName = () => {
    const raw = user?.name || '';
    // If the name looks like an email, use just the part before @
    if (raw.includes('@')) return raw.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    // Otherwise use first name only
    return raw.split(' ')[0] || 'there';
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '20px', fontWeight: 700 }}>
        <Activity size={24} style={{ color: '#6366f1' }} /> Loading Dashboard...
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .dash-section { animation: fade-up 0.5s ease-out both; }
      `}</style>

      {/* Header */}
      <div className="dash-section" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, letterSpacing: '0.5px' }}>All systems operational</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: '#f1f5f9', marginBottom: '4px', lineHeight: 1.2 }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{getDisplayName()}</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.55)' }}>Here's your hiring pipeline at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/resumes')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            <Upload size={15} /> Upload Resumes
          </button>
          <button onClick={() => navigate('/jobs')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <Plus size={15} /> New Job
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dash-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '36px', animationDelay: '0.1s' }}>
        <StatCard title="Active Jobs" value={stats.totalJobs} icon={<Briefcase size={20} />} color="#6366f1" sub="Open positions" />
        <StatCard title="Talent Pool" value={stats.totalCandidates} icon={<Users size={20} />} color="#10b981" sub="Parsed candidates" />
        <StatCard title="Resumes Processed" value={stats.totalResumes} icon={<FileText size={20} />} color="#f59e0b" sub="By AI pipeline" />
        <StatCard title="Upcoming Interviews" value={stats.upcomingInterviews} icon={<Calendar size={20} />} color="#ef4444" sub="Scheduled" />
      </div>

      {/* Bottom Grid */}
      <div className="dash-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animationDelay: '0.2s' }}>
        {/* Quick Actions */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#6366f1" />
            </div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickAction icon={<Plus size={18} />} label="Post a New Job" sub="Define role & requirements" color="#6366f1" onClick={() => navigate('/jobs')} />
            <QuickAction icon={<Upload size={18} />} label="Upload Resumes" sub="Bulk PDF processing" color="#8b5cf6" onClick={() => navigate('/resumes')} />
            <QuickAction icon={<TrendingUp size={18} />} label="View Rankings" sub="AI-ranked candidates" color="#06b6d4" onClick={() => navigate('/ranking')} />
            <QuickAction icon={<Calendar size={18} />} label="Manage Interviews" sub="View scheduled sessions" color="#10b981" onClick={() => navigate('/interviews')} />
          </div>
        </div>

        {/* AI Status Panel */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} color="#10b981" />
            </div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>AI Pipeline Status</h3>
          </div>

          {[
            { label: 'Resume Parser (Gemini AI)', status: 'Online', color: '#10b981' },
            { label: 'Vector Embedding Engine', status: 'Online', color: '#10b981' },
            { label: 'Email Notification Service', status: 'Online', color: '#10b981' },
            { label: 'Candidate Ranking System', status: 'Online', color: '#10b981' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '14px', color: 'rgba(148,163,184,0.75)', fontWeight: 500 }}>{item.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }}></div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.status}</span>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', flexShrink: 0, boxShadow: '0 0 8px #6366f1' }}></div>
            <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.7)', lineHeight: 1.5 }}>
              All AI services are running. Upload resumes to begin processing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
