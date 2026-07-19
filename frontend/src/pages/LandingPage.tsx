import { useNavigate } from 'react-router';
import { Brain, Upload, Star, Users, Zap, Shield, BarChart3, Mail, ChevronRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Upload,
    title: 'Bulk Resume Upload',
    desc: 'Upload hundreds of PDF resumes at once. Our AI extracts every critical detail automatically — no manual entry, ever.',
    color: '#6366f1',
  },
  {
    icon: Brain,
    title: 'AI-Powered Parsing',
    desc: 'Gemini AI reads between the lines. Skills, experience, education, companies — parsed with 99%+ accuracy in seconds.',
    color: '#8b5cf6',
  },
  {
    icon: Star,
    title: 'Smart Candidate Ranking',
    desc: 'Vector embedding similarity ranks every candidate against your job description. Hire the best fit, not just the loudest resume.',
    color: '#06b6d4',
  },
  {
    icon: Mail,
    title: 'Automated Email Workflows',
    desc: 'Shortlist alerts, interview invitations, and feedback notifications — all sent automatically the moment you take action.',
    color: '#10b981',
  },
  {
    icon: BarChart3,
    title: 'Hiring Analytics',
    desc: 'Real-time dashboards show pipeline health, interview outcomes, and time-to-hire metrics at a glance.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant & Secure',
    desc: 'Every HR recruiter sees only their own candidates. JWT-protected APIs and isolated data by design.',
    color: '#ef4444',
  },
];

const STATS = [
  { value: '10x', label: 'Faster Screening' },
  { value: '99%', label: 'Parse Accuracy' },
  { value: '< 30s', label: 'Per Resume' },
  { value: '100%', label: 'Automated' },
];

const STEPS = [
  { num: '01', title: 'Post a Job', desc: 'Define the role, department, and requirements in seconds.' },
  { num: '02', title: 'Upload Resumes', desc: 'Drag & drop any number of PDF resumes into the platform.' },
  { num: '03', title: 'AI Ranks Instantly', desc: 'Candidates are scored, ranked, and profiled automatically.' },
  { num: '04', title: 'Schedule & Hire', desc: 'Schedule interviews with one click. Email invites go out automatically.' },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0a0a0f', color: '#e2e8f0', fontFamily: "'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-title {
          animation: slide-up 0.8s ease-out both;
        }
        .hero-subtitle {
          animation: slide-up 0.8s ease-out 0.15s both;
        }
        .hero-cta {
          animation: slide-up 0.8s ease-out 0.3s both;
        }
        .hero-badge {
          animation: slide-up 0.8s ease-out 0.05s both;
        }
        .floating-card {
          animation: float 6s ease-in-out infinite;
        }
        .floating-card:nth-child(2) {
          animation-delay: -2s;
        }
        .floating-card:nth-child(3) {
          animation-delay: -4s;
        }
        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-green {
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-primary-landing {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          padding: 16px 36px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .btn-primary-landing:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.6);
        }
        .btn-secondary-landing {
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 16px 36px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }
        .btn-secondary-landing:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(99, 102, 241, 0.1);
        }
        .step-card {
          position: relative;
          padding: 32px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        .step-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(99, 102, 241, 0.25);
        }
        .nav-link {
          color: rgba(226, 232, 240, 0.7);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #e2e8f0;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: pulse-glow 4s ease-in-out infinite;
        }
        .stat-item {
          text-align: center;
          padding: 32px;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .stat-item:last-child {
          border-right: none;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px' }}>HireLoop<span className="gradient-text">AI</span></span>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <span className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
          <span className="nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</span>
          <button className="btn-secondary-landing" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary-landing" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 48px 80px', overflow: 'hidden' }}>
        {/* Background Orbs */}
        <div className="orb" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', top: '10%', left: '10%' }}></div>
        <div className="orb" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', top: '20%', right: '5%', animationDelay: '-2s' }}></div>
        <div className="orb" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', bottom: '10%', left: '40%', animationDelay: '-4s' }}></div>

        {/* Grid Pattern Overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '40px 40px', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.28)', borderRadius: '100px', padding: '7px 18px', marginBottom: '32px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#c084fc', letterSpacing: '0.5px' }}>THE FUTURE OF HIRING IS HERE</span>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '24px' }}>
            Hire Smarter,<br />
            <span className="gradient-text">Not Harder.</span>
          </h1>

          <p className="hero-subtitle" style={{ fontSize: '20px', color: 'rgba(226,232,240,0.65)', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 48px', fontWeight: 400 }}>
            HireLoop AI eliminates manual resume screening. Upload resumes in bulk, let Gemini parse and rank every candidate, then schedule interviews — all in one seamless platform.
          </p>

          <div className="hero-cta" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary-landing" onClick={() => navigate('/register')}>
              Start Hiring for Free <ChevronRight size={18} />
            </button>
            <button className="btn-secondary-landing" onClick={() => navigate('/login')}>
              Sign In to Dashboard
            </button>
          </div>

          <div style={{ marginTop: '56px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No credit card required', 'AI-powered from day one', 'Automated email notifications'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(226,232,240,0.5)' }}>
                <CheckCircle size={14} color="#10b981" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <div style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px' }} className="gradient-text">{s.value}</div>
              <div style={{ fontSize: '14px', color: 'rgba(226,232,240,0.5)', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '120px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Everything You Need</div>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Your entire hiring pipeline,<br /><span className="gradient-text">automated end-to-end.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${f.color}20`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#f1f5f9' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(226,232,240,0.55)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '80px 48px 120px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Simple Process</div>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
              From <span className="gradient-text-green">job post</span> to<br />hired candidate in 4 steps.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative' }}>
            {/* Connector Line */}
            <div style={{ position: 'absolute', top: '48px', left: '12.5%', right: '12.5%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(99,102,241,0.4), transparent)', zIndex: 0 }}></div>
            {STEPS.map(s => (
              <div key={s.num} className="step-card" style={{ zIndex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '16px', fontWeight: 800, color: '#a5b4fc' }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: '#f1f5f9' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(226,232,240,0.5)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)', top: '0', left: '50%', transform: 'translateX(-50%)' }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: '24px', lineHeight: 1.05 }}>
            Ready to transform<br />your <span className="gradient-text">hiring process?</span>
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(226,232,240,0.6)', marginBottom: '48px', lineHeight: 1.6 }}>
            Join forward-thinking HR teams using HireLoop AI to find the best candidates — automatically.
          </p>
          <button className="btn-primary-landing" style={{ padding: '20px 48px', fontSize: '18px' }} onClick={() => navigate('/register')}>
            Create Your Free Account <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={14} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>HireLoop<span className="gradient-text">AI</span></span>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(226,232,240,0.35)' }}>
          © 2026 HireLoop AI. Built with ❤️ for smarter hiring.
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span className="nav-link" onClick={() => navigate('/login')}>Sign In</span>
          <span className="nav-link" onClick={() => navigate('/register')}>Register</span>
        </div>
      </footer>
    </div>
  );
};
