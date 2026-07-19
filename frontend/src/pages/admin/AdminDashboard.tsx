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
  isApproved: boolean;
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

  const handleApprove = async (userId: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/approve`);
      setUsers(users.map(u => u.id === userId ? { ...u, isApproved: true } : u));
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/revoke`);
      setUsers(users.map(u => u.id === userId ? { ...u, isApproved: false } : u));
    } catch (err) {
      alert('Failed to revoke user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {/* Premium Header */}
      <div style={{ marginBottom: '40px', position: 'relative', overflow: 'hidden', padding: '32px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '20%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <div style={{
            padding: '14px', borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(245,158,11,0.2))',
            border: '1px solid rgba(239,68,68,0.4)',
            boxShadow: '0 8px 16px rgba(239,68,68,0.15)'
          }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Super Admin Portal
            </h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px', fontWeight: 500 }}>
              System-wide overview and administrative controls
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ padding: '20px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05)' }}>
              <Users size={36} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>Total HR</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{stats.totalUsers}</div>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ padding: '20px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05)' }}>
              <Briefcase size={36} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>Total Jobs</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{stats.totalJobs}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ padding: '20px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05)' }}>
              <Database size={36} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>Candidates</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{stats.totalCandidates}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ padding: '20px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))', color: '#f472b6', border: '1px solid rgba(236,72,153,0.2)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05)' }}>
              <FileText size={36} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>Resumes</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{stats.totalResumes}</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(15,23,42,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', color: '#f1f5f9' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)' }}><Activity size={20} color="#ef4444" /></div>
            Tenant Management
          </h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0 20px 16px 20px', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '0 20px 16px 20px', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0 20px 16px 20px', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '0 20px 16px 20px', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0 20px 16px 20px', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Joined</th>
                <th style={{ textAlign: 'right', padding: '0 20px 16px 20px', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ background: 'rgba(30,41,59,0.3)', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,41,59,0.6)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,41,59,0.3)'}>
                  <td style={{ padding: '20px', borderRadius: '16px 0 0 16px', color: '#f1f5f9', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ padding: '20px', color: '#94a3b8', fontSize: '14px' }}>{u.email}</td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ 
                      padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
                      background: u.role === 'SUPERADMIN' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: u.role === 'SUPERADMIN' ? '#f87171' : '#34d399',
                      border: u.role === 'SUPERADMIN' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    {u.isApproved ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} /> Approved
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} /> Pending
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '20px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right', borderRadius: '0 16px 16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      {!u.isApproved && (
                        <button onClick={() => handleApprove(u.id)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                          Approve
                        </button>
                      )}
                      {u.isApproved && u.role !== 'SUPERADMIN' && (
                        <button onClick={() => handleRevoke(u.id)} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}>
                          Revoke
                        </button>
                      )}
                      {u.role !== 'SUPERADMIN' && (
                        <button onClick={() => handleDelete(u.id)} style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.8)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
