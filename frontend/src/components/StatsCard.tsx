import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, value, icon, trend, 
  color = 'var(--accent-primary)',
  className = ''
}) => {
  return (
    <div className={`glass-card ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: 0.05, borderTopRightRadius: '20px', pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>{title}</div>
        <div style={{ 
          color, 
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          padding: '10px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 20px color-mix(in srgb, ${color} 30%, transparent)`,
          position: 'relative',
          zIndex: 1
        }}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{value}</div>
        {trend && (
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--accent-emerald)', 
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};
