import React, { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowRight, Hexagon, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

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
            Forgot Password?
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Enter your email to receive a password reset link.
          </p>
        </div>

        <div className="glass-card animate-fade-in" style={{ padding: '40px' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%', color: '#10b981' }}>
                  <Mail size={48} />
                </div>
              </div>
              <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'white' }}>Check your email</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Back to Login
              </Link>
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
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  <>Send Reset Link <ArrowRight size={18} /></>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Remembered your password? </span>
                <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
