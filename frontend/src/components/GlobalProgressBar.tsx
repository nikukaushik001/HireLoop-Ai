import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export const GlobalProgressBar = () => {
  const [jobId, setJobId] = useState<string | null>(localStorage.getItem('activeJobId'));
  const [progress, setProgress] = useState<{ processed: number, total: number, status: string } | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setJobId(localStorage.getItem('activeJobId'));
    };
    
    window.addEventListener('jobIdUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('jobIdUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (jobId) {
      interval = setInterval(async () => {
        try {
          const res = await apiClient.get(`/resumes/progress/${jobId}`);
          if (res.data.data) {
            setProgress(res.data.data);
            if (res.data.data.status === 'completed') {
              clearInterval(interval);
              setTimeout(() => {
                localStorage.removeItem('activeJobId');
                setJobId(null);
                setProgress(null);
              }, 4000); // Keep it on screen for 4s after completion
            }
          }
        } catch (err) {
          console.error('Failed to fetch global progress', err);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [jobId]);

  if (!jobId || !progress) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      animation: 'slideUpFadeGlobal 0.5s ease-out'
    }}>
      <style>{`
        @keyframes slideUpFadeGlobal {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseDotGlobal {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
      <div className="glass-card" style={{
        padding: '16px 24px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '280px',
        border: progress.status === 'completed' ? '1px solid var(--accent-emerald)' : '1px solid rgba(59, 130, 246, 0.3)',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {progress.status === 'completed' ? (
              <CheckCircle size={18} color="var(--accent-emerald)" />
            ) : (
              <div style={{ 
                width: '10px', height: '10px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%',
                animation: 'pulseDotGlobal 2s infinite'
              }} />
            )}
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f8fafc' }}>
              {progress.status === 'completed' ? 'All Resumes Processed' : 'Live Parsing Session'}
            </span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: progress.status === 'completed' ? 'var(--accent-emerald)' : '#60a5fa' }}>
            {progress.processed} / {progress.total}
          </span>
        </div>
        
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: progress.status === 'completed' ? 'var(--accent-emerald)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)', 
            width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%`,
            transition: 'width 0.5s ease, background 0.5s ease'
          }} />
        </div>
      </div>
    </div>
  );
};
