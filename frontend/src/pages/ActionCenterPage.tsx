import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '../api/client';
import { Users, CheckCircle, XCircle, CalendarPlus, Eye } from 'lucide-react';

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

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

export const ActionCenterPage = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('NEW');
  const [filterJob, setFilterJob] = useState('ALL');
  const [sortBy, setSortBy] = useState('SCORE_DESC');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/dashboard/recent-applications');
      setApps(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (jobId: string, appId: string, status: string) => {
    try {
      await apiClient.patch(`/jobs/${jobId}/applications/${appId}/status`, { status });
      fetchApps();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '14px' }}>Loading action center...</p>
        </div>
      </div>
    );
  }

  // Extract unique jobs for the filter dropdown
  const uniqueJobs = Array.from(new Set(apps.map(a => a.job.title)));

  // Apply filters and sorting
  let processedApps = [...apps];
  if (filterStatus !== 'ALL') {
    processedApps = processedApps.filter(a => a.status === filterStatus);
  }
  
  if (filterJob !== 'ALL') {
    processedApps = processedApps.filter(a => a.job.title === filterJob);
  }
  
  if (sortBy === 'SCORE_DESC') {
    processedApps.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  }

  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 48px' }}>
      <style>{`
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
        
        .filter-select {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #f1f5f9; padding: 8px 12px; border-radius: 8px; font-size: 12px;
          font-family: 'Inter', sans-serif; outline: none; cursor: pointer;
        }
        .filter-select:hover { background: rgba(255,255,255,0.08); }
        .filter-select option { background: #0f172a; color: white; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0' }} className="text-gradient">Action Center</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Review, shortlist, and schedule interviews for recent applications.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="filter-select" value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
            <option value="ALL">All Jobs</option>
            {uniqueJobs.map(jobTitle => (
              <option key={jobTitle} value={jobTitle}>{jobTitle}</option>
            ))}
          </select>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="NEW">Needs Review (New)</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="SCORE_DESC">Sort by: Highest AI Score</option>
            <option value="DATE">Sort by: Newest First</option>
          </select>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008))',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(90deg, rgba(56,189,248,0.04), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.15))', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>Applications Queue</h3>
              <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.5)' }}>
                {filterStatus === 'NEW' ? 'Pending your review' : `Showing ${filterStatus} applications`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '99px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#7dd3fc' }}>{processedApps.length} Candidates</span>
          </div>
        </div>
        
        {processedApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={32} style={{ opacity: 0.3 }} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#e2e8f0' }}>No candidates found</h3>
            <p style={{ fontSize: '14px', margin: 0, color: 'rgba(148,163,184,0.6)' }}>Try changing your filters or check back later.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '14px 28px', fontWeight: 600, fontSize: '11px', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Candidate</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '11px', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Job Position</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '11px', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>AI Score</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '11px', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '14px 28px', fontWeight: 600, fontSize: '11px', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedApps.map((app, idx) => {
                  const sc = getStatusConfig(app.status);
                  return (
                    <tr key={app.id} className="action-row" style={{ borderBottom: idx < processedApps.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', cursor: 'default' }}>
                      <td style={{ padding: '16px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${sc.color}30, ${sc.color}10)`,
                            border: `1px solid ${sc.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 800, color: sc.color
                          }}>
                            {app.candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '2px', fontSize: '13px' }}>{app.candidate.name}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.45)' }}>{app.candidate.currentCompany || 'No Company'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(226,232,240,0.75)', fontSize: '13px', fontWeight: 500 }}>{app.job.title}</td>
                      <td style={{ padding: '16px' }}>
                        {app.aiScore ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '48px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                              <div style={{ width: `${app.aiScore}%`, height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${getScoreColor(app.aiScore)}, ${getScoreColor(app.aiScore)}cc)`, transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: getScoreColor(app.aiScore), fontVariantNumeric: 'tabular-nums' }}>{app.aiScore}</span>
                          </div>
                        ) : <span style={{ color: 'rgba(148,163,184,0.35)', fontSize: '12px' }}>—</span>}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                          letterSpacing: '0.2px'
                        }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                          {app.status === 'NEW' && (
                            <>
                              <button onClick={() => handleAction(app.job.id, app.id, 'SHORTLISTED')} className="action-btn action-btn-shortlist">
                                <CheckCircle size={12} /> Shortlist
                              </button>
                              <button onClick={() => handleAction(app.job.id, app.id, 'REJECTED')} className="action-btn action-btn-reject">
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {app.status === 'SHORTLISTED' && (
                            <button onClick={() => navigate(`/schedule-interview?jobId=${app.job.id}&appId=${app.id}`)} className="action-btn action-btn-schedule">
                              <CalendarPlus size={12} /> Schedule
                            </button>
                          )}
                          <button onClick={() => navigate(`/candidates/${app.candidate.id}`)} className="action-btn action-btn-view">
                            <Eye size={12} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
