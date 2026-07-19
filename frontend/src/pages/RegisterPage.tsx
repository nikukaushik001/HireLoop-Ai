import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { useNavigate, Link } from 'react-router';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
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
      const res = await apiClient.post('/auth/register', { name, email, password });
      await login(res.data.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
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
      setError(err.response?.data?.error?.message || 'Google sign-up failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['transparent', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#060612' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

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

        .reg-input {
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
        .reg-input:focus {
          border-color: rgba(139, 92, 246, 0.7);
          background: rgba(139, 92, 246, 0.06);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
        }
        .reg-input::placeholder { color: rgba(148,163,184,0.4); }

        .reg-btn {
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
        .reg-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .reg-btn:hover:not(:disabled)::before { opacity: 1; }
        .reg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,58,237,0.55); }
        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 65%)', filter: 'blur(70px)', animation: 'float-slow 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'float-slow 16s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '30%', right: '60%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)', filter: 'blur(50px)', animation: 'float-slow 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Decorative rings */}
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: '200px', height: '200px', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '50%', animation: 'spin-slow 30s linear infinite reverse' }}>
          <div style={{ position: 'absolute', top: '-4px', left: '50%', width: '8px', height: '8px', background: '#7c3aed', borderRadius: '50%', transform: 'translateX(-50%)', boxShadow: '0 0 12px #7c3aed' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '8%', right: '6%', width: '140px', height: '140px', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '50%', animation: 'spin-slow 22s linear infinite' }}>
          <div style={{ position: 'absolute', bottom: '-4px', left: '50%', width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%', transform: 'translateX(-50%)', boxShadow: '0 0 10px #6366f1' }} />
        </div>
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px',
        background: 'rgba(10, 10, 20, 0.78)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        animation: 'card-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,58,237,0.45)', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 8v4l3 3" /><circle cx="18" cy="6" r="3" fill="white" stroke="none" /></svg>
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            HireLoop<span style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: '4px' }}>Create account</h1>
        <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.6)', marginBottom: '24px' }}>Start your AI-powered hiring journey.</p>

        {error && (
          <div style={{ padding: '11px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', marginBottom: '18px', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: '6px', letterSpacing: '0.3px' }}>FULL NAME</label>
            <input type="text" className="reg-input" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: '6px', letterSpacing: '0.3px' }}>EMAIL</label>
            <input type="email" className="reg-input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: '6px', letterSpacing: '0.3px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="reg-input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength */}
            {password.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '8px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                ))}
                <span style={{ fontSize: '11px', color: strengthColors[strength], fontWeight: 700, marginLeft: '6px', minWidth: '36px' }}>{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          <button type="submit" className="reg-btn" disabled={isSubmitting} style={{ marginTop: '8px' }}>
            {isSubmitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : 'Create Account'}
          </button>
        </form>

        <div style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.4)', fontWeight: 600, letterSpacing: '0.8px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-up failed.')} theme="filled_black" shape="pill" size="large" text="continue_with" />
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(148,163,184,0.45)', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};
