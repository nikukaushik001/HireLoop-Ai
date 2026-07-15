import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { useNavigate, Link } from 'react-router';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      await login(res.data.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="glass-card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }} className="text-gradient">Welcome Back</h2>
        {error && <div style={{ color: 'var(--accent-rose)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Login</button>
        </form>
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};
