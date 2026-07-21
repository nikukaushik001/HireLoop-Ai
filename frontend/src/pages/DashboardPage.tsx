import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import {
  Briefcase, Users, FileText, Calendar,
  ArrowUpRight, Plus, Upload, TrendingUp,
  Zap, Activity, ChevronRight, Sparkles,
  CheckCircle, XCircle, Eye, CalendarPlus
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
  title, value, icon, color, sub, trend, accentGradient
}: {
  title: string; value: number; icon: React.ReactNode; color: string; sub: string; trend?: string; accentGradient: string;
}) => (
  <div
    style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', cursor: 'default'
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = 'translateY(-5px) scale(1.01)';
      el.style.borderColor = `${color}40`;
      el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px ${color}20, inset 0 1px 0 rgba(255,255,255,0.06)`;
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = 'translateY(0) scale(1)';
      el.style.borderColor = 'rgba(255,255,255,0.07)';
      el.style.boxShadow = 'none';
    }}
  >
    {/* Top accent bar */}
    <div style={{ height: '3px', background: accentGradient, opacity: 0.8 }} />
    <div style={{ padding: '22px 24px 24px' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, filter: 'blur(25px)' }} />
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${color}25, ${color}10)`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, backdropFilter: 'blur(8px)' }}>
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
      <div style={{ fontSize: '44px', fontWeight: 900, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1, marginBottom: '8px', fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedNumber value={value} />
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.45)' }}>{sub}</div>
    </div>
  </div>
);

// Status config helper
const getStatusConfig = (status: string) => {
  const configs: Record<string, { bg: string; color: string; border: string; label: string }> = {
    NEW: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)', label: 'New' },
    SHORTLISTED: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)', label: 'Shortlisted' },
    INTERVIEWING: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)', label: 'Interviewing' },
    REJECTED: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)', label: 'Rejected' },
    OFFERED: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)', label: 'Offered' },
  };
  return configs[status] || { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)', label: status };
};

// Score bar color helper
const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

export const DashboardPage = () => {
  const [stats, setStats] = useState<Stats>({ totalJobs: 0, totalCandidates: 0, totalResumes: 0, upcomingInterviews: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get('/dashboard/stats'),
      apiClient.get('/dashboard/recent-applications')
    ])
    .then(([statsRes, appsRes]) => {
      setStats(statsRes.data.data);
      setRecentApps(appsRes.data.data);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  };

  const handleAction = async (jobId: string, appId: string, status: string) => {
    try {
      await apiClient.patch(`/jobs/${jobId}/applications/${appId}/status`, { status });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

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
    { label: 'Resume Parser', sub: 'Gemini AI', color: '#10b981', icon: <FileText size={14} /> },
    { label: 'Vector Embeddings', sub: 'Similarity engine', color: '#10b981', icon: <Sparkles size={14} /> },
    { label: 'Email Notifications', sub: 'SMTP / Nodemailer', color: '#10b981', icon: <Zap size={14} /> },
    { label: 'Candidate Ranking', sub: 'AI scoring', color: '#10b981', icon: <TrendingUp size={14} /> },
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
        @keyframes mesh-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .dash-s1 { animation: fade-up 0.45s ease-out both; }
        .dash-s2 { animation: fade-up 0.45s 0.1s ease-out both; }
        .dash-s3 { animation: fade-up 0.45s 0.2s ease-out both; }
        .dash-s4 { animation: fade-up 0.45s 0.3s ease-out both; }
        .act-btn { transition: all 0.22s; }
        .act-btn:hover { background: rgba(255,255,255,0.06) !important; transform: translateX(4px); }
        .action-row { transition: all 0.2s ease; }
        .action-row:hover { background: rgba(99,102,241,0.04) !important; }
        .action-row:hover td { color: #e2e8f0 !important; }
        .action-btn {
          display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px;
          border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;
          transition: all 0.2s ease; font-family: 'Inter', sans-serif; border: 1px solid;
          white-space: nowrap;
        }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .action-btn-shortlist { background: rgba(16,185,129,0.1); color: #34d399; border-color: rgba(16,185,129,0.25); }
        .action-btn-shortlist:hover { background: rgba(16,185,129,0.2); }
        .action-btn-reject { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.25); }
        .action-btn-reject:hover { background: rgba(239,68,68,0.2); }
        .action-btn-schedule { background: rgba(99,102,241,0.1); color: #818cf8; border-color: rgba(99,102,241,0.25); }
        .action-btn-schedule:hover { background: rgba(99,102,241,0.2); }
        .action-btn-view { background: rgba(255,255,255,0.04); color: #94a3b8; border-color: rgba(255,255,255,0.1); }
        .action-btn-view:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
      `}</style>

      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <div className="dash-s1" style={{
        position: 'relative', borderRadius: '24px', padding: '36px 40px', marginBottom: '28px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #13111f 0%, #0f1629 40%, #111a30 70%, #0d1a2a 100%)',
        border: '1px solid rgba(99,102,241,0.15)'
      }}>
        {/* Animated mesh gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          background: 'linear-gradient(270deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08), rgba(139,92,246,0.1), rgba(6,182,212,0.06))',
          backgroundSize: '400% 400%', animation: 'mesh-shift 12s ease infinite'
        }} />
        {/* Banner glows */}
        <div style={{ position: 'absolute', top: '-60px', right: '60px', width: '320px', height: '240px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '250px', height: '180px', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px', borderRadius: '24px' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '99px', marginBottom: '16px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px rgba(6,182,212,0.8)', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#67e8f9', letterSpacing: '0.8px', textTransform: 'uppercase' }}>AI Hiring Autopilot — Active</span>
            </div>
            <h1 style={{ fontSize: '34px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '10px' }}>
              Welcome back, <span style={{ background: 'linear-gradient(135deg, #818cf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{getDisplayName()}</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.6)', lineHeight: 1.7, maxWidth: '420px', margin: 0 }}>
              Your AI hiring pipeline is live and processing. Here's your workspace at a glance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/resumes')} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 20px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', backdropFilter: 'blur(8px)'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <Upload size={14} /> Upload Resumes
            </button>
            <button onClick={() => navigate('/jobs')} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 20px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
              borderRadius: '12px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", transition: 'all 0.25s',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'; }}
            >
              <Plus size={14} /> New Job
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="dash-s2 stats-grid">
        <StatCard title="Active Jobs" value={stats.totalJobs} icon={<Briefcase size={21} />} color="#6366f1" sub="Open positions" trend="+2 this week" accentGradient="linear-gradient(90deg, #6366f1, #818cf8)" />
        <StatCard title="Talent Pool" value={stats.totalCandidates} icon={<Users size={21} />} color="#10b981" sub="AI-parsed candidates" trend="Live" accentGradient="linear-gradient(90deg, #10b981, #34d399)" />
        <StatCard title="Resumes Processed" value={stats.totalResumes} icon={<FileText size={21} />} color="#f59e0b" sub="By Gemini pipeline" accentGradient="linear-gradient(90deg, #f59e0b, #fbbf24)" />
        <StatCard title="Upcoming Interviews" value={stats.upcomingInterviews} icon={<Calendar size={21} />} color="#ef4444" sub="Scheduled" accentGradient="linear-gradient(90deg, #ef4444, #f87171)" />
      </div>

      {/* ── Bottom Grid ───────────────────────────────────────────── */}
      <div className="dash-s3 dashboard-content-grid">

        {/* Quick Actions */}
        <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
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
        <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', position: 'relative' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#10b981" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>AI Pipeline</h3>
            <div style={{ marginLeft: 'auto', padding: '4px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
              4/4 Online
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
            {pipelineItems.map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < pipelineItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${item.color}12`, border: `1px solid ${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginRight: '12px', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{item.label}</span>
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

      {/* ── Action Center logic moved to dedicated ActionCenterPage ─────────────────── */}
    </div>
  );
};
