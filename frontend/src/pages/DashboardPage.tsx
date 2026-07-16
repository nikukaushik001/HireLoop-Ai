import React, { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { Briefcase, Users, FileText, Calendar, Activity } from 'lucide-react';
import { apiClient } from '../api/client';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    totalResumes: 0,
    upcomingInterviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div className="text-gradient" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Activity size={24} className="animate-pulse" /> Loading Dashboard...
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Here's what's happening with your hiring pipeline today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary"><FileText size={16} /> Process Resumes</button>
          <button className="btn btn-primary"><Briefcase size={16} /> New Job</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <StatsCard 
          title="Active Jobs" 
          value={stats.totalJobs} 
          icon={<Briefcase size={20} />} 
          color="var(--accent-primary)"
          className="animate-fade-in stagger-1"
        />
        <StatsCard 
          title="Talent Pool" 
          value={stats.totalCandidates} 
          icon={<Users size={20} />} 
          color="var(--accent-emerald)"
          className="animate-fade-in stagger-2"
        />
        <StatsCard 
          title="Resumes Processed" 
          value={stats.totalResumes} 
          icon={<FileText size={20} />} 
          color="var(--accent-amber)"
          className="animate-fade-in stagger-3"
        />
        <StatsCard 
          title="Upcoming Interviews" 
          value={stats.upcomingInterviews} 
          icon={<Calendar size={20} />} 
          color="var(--accent-rose)"
          className="animate-fade-in stagger-4"
        />
      </div>

      <div className="glass-card animate-fade-in stagger-4" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Activity size={20} color="var(--accent-primary)" />
          </div>
          <h3 style={{ margin: 0, fontSize: '20px' }}>Recent Activity</h3>
        </div>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          border: '1px dashed var(--glass-border)', 
          borderRadius: '16px', 
          padding: '40px', 
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          System is running smoothly. Your AI pipelines are standing by.
        </div>
      </div>
    </div>
  );
};
