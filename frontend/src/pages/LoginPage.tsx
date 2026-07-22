import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { useNavigate, Link } from 'react-router';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader2, Brain } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      await login(res.data.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/auth/google', { token: credentialResponse.credential });
      await login(res.data.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Superadmin approval required then login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#060612' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes mesh-move {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -20px) rotate(120deg); }
          66% { transform: translate(-20px, 30px) rotate(240deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.03); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: rgba(139, 92, 246, 0.7);
          background: rgba(139, 92, 246, 0.06);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
        }
        .login-input::placeholder { color: rgba(148,163,184,0.4); }

        .sign-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%);
          color: white;
          box-shadow: 0 4px 24px rgba(124, 58, 237, 0.45);
          position: relative;
          overflow: hidden;
        }
        .sign-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .sign-btn:hover:not(:disabled)::before { opacity: 1; }
        .sign-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,58,237,0.55); }
        .sign-btn:active:not(:disabled) { transform: translateY(0); }
        .sign-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Animated mesh background blobs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'float-slow 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)', filter: 'blur(70px)', animation: 'float-slow 14s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '40%', left: '55%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)', filter: 'blur(50px)', animation: 'float-slow 18s ease-in-out infinite' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Spinning ring decoration */}
        <div style={{ position: 'absolute', top: '8%', right: '12%', width: '180px', height: '180px', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '50%', animation: 'spin-slow 25s linear infinite' }}>
          <div style={{ position: 'absolute', top: '-4px', left: '50%', width: '8px', height: '8px', background: '#7c3aed', borderRadius: '50%', transform: 'translateX(-50%)', boxShadow: '0 0 12px #7c3aed' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '12%', left: '8%', width: '120px', height: '120px', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '50%', animation: 'spin-slow 20s linear infinite reverse' }}>
          <div style={{ position: 'absolute', bottom: '-4px', left: '50%', width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%', transform: 'translateX(-50%)', boxShadow: '0 0 10px #6366f1' }} />
        </div>
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px',
        background: 'rgba(10, 10, 20, 0.75)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        animation: 'card-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.45)', flexShrink: 0 }}>
            <Brain size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            HireLoop<span style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </span>
        </Link>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: '4px' }}>Sign in</h1>
        <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.6)', marginBottom: '28px' }}>Welcome back — let's get hiring.</p>

        {error && (
          <div style={{ padding: '11px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: '6px', letterSpacing: '0.3px' }}>EMAIL</label>
            <input type="email" className="login-input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', letterSpacing: '0.3px' }}>PASSWORD</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="login-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="sign-btn" disabled={isSubmitting} style={{ marginTop: '6px' }}>
            {isSubmitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.4)', fontWeight: 600, letterSpacing: '0.8px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Superadmin approval required then login.')} theme="filled_black" shape="pill" size="large" text="continue_with" />
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(148,163,184,0.45)', marginTop: '28px' }}>
          New to HireLoop?{' '}
          <Link to="/register" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};
