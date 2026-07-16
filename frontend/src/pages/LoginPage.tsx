import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { useNavigate, Link } from 'react-router';
import { Hexagon, Sparkles, BrainCircuit } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      await login(res.data.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
      position: 'relative', overflow: 'hidden', padding: '24px'
    }}>
      {/* Floating Elements Background */}
      <div style={{ position: 'absolute', top: '15%', left: '15%', opacity: 0.1, animation: 'floatBackground 15s infinite alternate ease-in-out' }}>
        <BrainCircuit size={200} color="var(--accent-primary)" />
      </div>
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', opacity: 0.1, animation: 'floatBackground 20s infinite alternate-reverse ease-in-out' }}>
        <Hexagon size={250} color="var(--accent-emerald)" />
      </div>

      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-emerald))',
            padding: '16px', borderRadius: '20px', display: 'flex',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={32} color="white" />
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
            <span className="text-gradient">Welcome Back</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Sign in to continue to HireLoop.ai</p>
        </div>

        {error && (
          <div className="animate-fade-in" style={{ 
            background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Work Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="you@company.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '12px' }}>Forgot password?</span>
            </label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '14px' }} disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Request Access</Link>
        </div>
      </div>
    </div>
  );
};
