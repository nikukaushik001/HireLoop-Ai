import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import {
  Briefcase, Users, FileText, Calendar,
  ArrowUpRight, Plus, Upload, TrendingUp,
  Zap, Activity, ChevronRight, Sparkles
} from 'lucide-react';

interface Stats {
  totalJobs: number;
  totalCandidates: number;
  totalResumes: number;
  upcomingInterviews: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const duration = 800;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
};

const StatCard = ({
  title, value, icon, color, sub, trend
}: {
  title: string; value: number; icon: React.ReactNode; color: string; sub: string; trend?: string;
}) => (
  <div
    style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', cursor: 'default'
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = 'translateY(-4px)';
      el.style.borderColor = `${color}40`;
      el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${color}20`;
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = 'translateY(0)';
      el.style.borderColor = 'rgba(255,255,255,0.07)';
      el.style.boxShadow = 'none';
    }}
  >
    {/* Background glow */}
    <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, filter: 'blur(20px)' }} />
    {/* Top row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: `linear-gradient(135deg, ${color}22, ${color}10)`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px' }}>
          <ArrowUpRight size={12} color="#10b981" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>{trend}</span>
        </div>
      )}
    </div>
    {/* Value */}
    <div style={{ fontSize: '42px', fontWeight: 900, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1, marginBottom: '6px', fontVariantNumeric: 'tabular-nums' }}>
      <AnimatedNumber value={value} />
    </div>
    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '3px' }}>{title}</div>
    <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.4)' }}>{sub}</div>
  </div>
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
    let name = raw.includes('@') ? raw.split('@')[0] : raw;
    name = name.replace(/[0-9._-]/g, ' ').trim();
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'there';
    return words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '14px' }}>Loading your workspace…</p>
      </div>
    </div>
  );

  const pipelineItems = [
    { label: 'Resume Parser', sub: 'Gemini AI', color: '#10b981' },
    { label: 'Vector Embeddings', sub: 'Similarity engine', color: '#10b981' },
    { label: 'Email Notifications', sub: 'SMTP / Nodemailer', color: '#10b981' },
    { label: 'Candidate Ranking', sub: 'AI scoring', color: '#10b981' },
  ];

  const actions = [
    { icon: <Plus size={17} />, label: 'Post a New Job', sub: 'Define role & requirements', color: '#6366f1', path: '/jobs' },
    { icon: <Upload size={17} />, label: 'Upload Resumes', sub: 'Bulk AI PDF processing', color: '#8b5cf6', path: '/resumes' },
    { icon: <TrendingUp size={17} />, label: 'View Rankings', sub: 'AI-ranked candidates', color: '#06b6d4', path: '/ranking' },
    { icon: <Calendar size={17} />, label: 'Manage Interviews', sub: 'Scheduled sessions', color: '#10b981', path: '/interviews' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow: 0 0 0 5px rgba(16,185,129,0); } }
        .dash-s1 { animation: fade-up 0.45s ease-out both; }
        .dash-s2 { animation: fade-up 0.45s 0.1s ease-out both; }
        .dash-s3 { animation: fade-up 0.45s 0.2s ease-out both; }
        .act-btn { transition: all 0.22s; }
        .act-btn:hover { background: rgba(255,255,255,0.06) !important; transform: translateX(4px); }
      `}</style>

      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <div className="dash-s1" style={{
        position: 'relative', borderRadius: '24px', padding: '32px 36px', marginBottom: '28px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #13111f 0%, #0f1629 60%, #0d1a2a 100%)',
        border: '1px solid rgba(99,102,241,0.15)'
      }}>
        {/* Banner glows */}
        <div style={{ position: 'absolute', top: '-40px', right: '80px', width: '280px', height: '200px', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', right: '20%', width: '200px', height: '150px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', borderRadius: '24px' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '99px', marginBottom: '14px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px rgba(6,182,212,0.7)', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#67e8f9', letterSpacing: '0.4px' }}>AI HIRING AUTOPILOT — ACTIVE</span>
          </div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '8px' }}>
              Welcome back, {getDisplayName()}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.55)', lineHeight: 1.6, maxWidth: '400px' }}>
              Your AI hiring pipeline is live. Here's your workspace at a glance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button onClick={() => navigate('/resumes')} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            >
              <Upload size={14} /> Upload Resumes
            </button>
            <button onClick={() => navigate('/jobs')} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
              borderRadius: '12px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}
            >
              <Plus size={14} /> New Job
            </button>
          </div>
        </div>


      </div>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="dash-s2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Active Jobs" value={stats.totalJobs} icon={<Briefcase size={20} />} color="#6366f1" sub="Open positions" trend="+2 this week" />
        <StatCard title="Talent Pool" value={stats.totalCandidates} icon={<Users size={20} />} color="#10b981" sub="AI-parsed candidates" trend="Live" />
        <StatCard title="Resumes Processed" value={stats.totalResumes} icon={<FileText size={20} />} color="#f59e0b" sub="By Gemini pipeline" />
        <StatCard title="Upcoming Interviews" value={stats.upcomingInterviews} icon={<Calendar size={20} />} color="#ef4444" sub="Scheduled" />
      </div>

      {/* ── Bottom Grid ───────────────────────────────────────────── */}
      <div className="dash-s3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Quick Actions */}
        <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#818cf8" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actions.map(a => (
              <button key={a.label} className="act-btn" onClick={() => navigate(a.path)} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px',
                cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: "'Inter', sans-serif"
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${a.color}15`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '1px' }}>{a.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.5)' }}>{a.sub}</div>
                </div>
                <ChevronRight size={15} style={{ color: 'rgba(148,163,184,0.25)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* AI Pipeline Status */}
        <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', position: 'relative' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#10b981" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>AI Pipeline</h3>
            <div style={{ marginLeft: 'auto', padding: '3px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
              4/4 Online
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
            {pipelineItems.map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < pipelineItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.4)' }}>{item.sub}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, animation: 'pulse-dot 2s infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: item.color }}>Online</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color="#818cf8" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.6)', lineHeight: 1.5 }}>
              Upload resumes to start the AI processing pipeline.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
