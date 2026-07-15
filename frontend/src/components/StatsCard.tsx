import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color = 'var(--accent-primary)' }) => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{title}</div>
        <div style={{ 
          color, 
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          padding: '8px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
        {trend && (
          <div style={{ fontSize: '13px', color: 'var(--accent-emerald)', fontWeight: 500 }}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};
