import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Lock, ArrowRight, Hexagon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return null; // Will show error via useEffect
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, rgba(3, 7, 18, 1) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-emerald))',
              padding: '12px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
            }}>
              <Hexagon size={36} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '32px', margin: '0 0 8px', fontWeight: 800 }} className="text-gradient">
            Create New Password
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Your new password must be different from previous used passwords.
          </p>
        </div>

        <div className="glass-card animate-fade-in" style={{ padding: '40px' }}>
          {!token ? (
             <div style={{ textAlign: 'center' }}>
             <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
               <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '50%', color: '#ef4444' }}>
                 <AlertCircle size={48} />
               </div>
             </div>
             <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'white' }}>Invalid Link</h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
               {error}
             </p>
             <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
               Request New Link
             </Link>
           </div>
          ) : success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%', color: '#10b981' }}>
                  <CheckCircle2 size={48} />
                </div>
              </div>
              <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'white' }}>Password Reset Successfully</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                You will be redirected to the login page momentarily...
              </p>
              <Loader2 size={24} className="animate-spin mx-auto" style={{ color: 'var(--accent-primary)' }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{ 
                  padding: '12px 16px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  color: 'var(--accent-rose)',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              
              <div className="input-group">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px', height: '48px' }}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>Reset Password <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
