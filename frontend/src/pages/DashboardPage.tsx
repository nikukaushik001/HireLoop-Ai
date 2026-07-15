import React, { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { Briefcase, Users, FileText, Calendar } from 'lucide-react';
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

  if (loading) return <div className="animate-fade-in text-gradient" style={{ fontSize: '20px' }}>Loading Dashboard...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="text-gradient">Dashboard Overview</h1>
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
        />
        <StatsCard 
          title="Talent Pool" 
          value={stats.totalCandidates} 
          icon={<Users size={20} />} 
          color="var(--accent-emerald)"
        />
        <StatsCard 
          title="Resumes Processed" 
          value={stats.totalResumes} 
          icon={<FileText size={20} />} 
          color="var(--accent-amber)"
        />
        <StatsCard 
          title="Upcoming Interviews" 
          value={stats.upcomingInterviews} 
          icon={<Calendar size={20} />} 
          color="var(--accent-rose)"
        />
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Recent Activity</h3>
        <div style={{ color: 'var(--text-muted)' }}>
          System is running smoothly. Your AI pipelines are standing by.
        </div>
      </div>
    </div>
  );
};
