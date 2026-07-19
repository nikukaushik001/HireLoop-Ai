import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Database, FileText, Briefcase, Activity, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface SystemStats {
  totalUsers: number;
  totalJobs: number;
  totalCandidates: number;
  totalResumes: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/admin/users')
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="text-gradient">Loading Admin Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle /> {error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '10px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.2))',
            border: '1px solid rgba(239,68,68,0.3)'
          }}>
            <ShieldAlert size={24} color="#ef4444" />
          </div>
          <h1 className="text-gradient" style={{ margin: 0 }}>Super Admin Control Panel</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
          System-wide overview and administrative controls across all tenants.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
              <Users size={32} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Users (HR)</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalUsers}</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <Briefcase size={32} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Jobs</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalJobs}</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
              <Database size={32} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Candidates</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalCandidates}</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
              <FileText size={32} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Resumes</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalResumes}</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} color="#ef4444" /> System Users
        </h2>
        
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>User</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    background: u.role === 'ADMIN' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                    color: u.role === 'ADMIN' ? '#ef4444' : '#10b981',
                    border: u.role === 'ADMIN' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
