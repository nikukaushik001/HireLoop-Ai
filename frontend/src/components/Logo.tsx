import React from 'react';
import { Radar } from 'lucide-react';
import { Link } from 'react-router';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  withLink?: boolean;
  linkTo?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showSubtitle = false, 
  subtitleText = 'Intelligent ATS',
  withLink = false,
  linkTo = '/',
  onClick
}) => {
  // Scaling factors based on size
  const sizes = {
    sm: {
      boxSize: '28px',
      iconSize: 14,
      textSize: '18px',
      gap: '8px',
      subtitleSize: '9px',
      borderRadius: '6px'
    },
    md: {
      boxSize: '36px',
      iconSize: 20,
      textSize: '20px',
      gap: '10px',
      subtitleSize: '10px',
      borderRadius: '10px'
    },
    lg: {
      boxSize: '48px',
      iconSize: 24,
      textSize: '26px',
      gap: '12px',
      subtitleSize: '11px',
      borderRadius: '12px'
    },
    xl: {
      boxSize: '64px',
      iconSize: 32,
      textSize: '36px',
      gap: '16px',
      subtitleSize: '12px',
      borderRadius: '16px'
    }
  };

  const currentSize = sizes[size];

  const content = (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: currentSize.gap }}>
        <div style={{
          width: currentSize.boxSize, 
          height: currentSize.boxSize,
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', // Deep blue to bright blue gradient
          borderRadius: currentSize.borderRadius, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.45)', // Blue glow
          flexShrink: 0
        }}>
          <Radar size={currentSize.iconSize} color="white" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
          <span style={{ 
            fontWeight: 800, 
            fontSize: currentSize.textSize, 
            letterSpacing: '-0.5px', 
            lineHeight: 1,
            color: 'white',
            display: 'flex',
            alignItems: 'baseline'
          }}>
            HireLoop
            <span style={{ 
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginLeft: '2px'
            }}>
              .ai
            </span>
          </span>
          {showSubtitle && subtitleText === 'Intelligent ATS' && (
            <div style={{ 
              fontSize: currentSize.subtitleSize, 
              color: 'rgba(148,163,184,0.7)', 
              fontWeight: 600, 
              letterSpacing: '1px', 
              textTransform: 'uppercase', 
              marginTop: '4px' 
            }}>
              {subtitleText}
            </div>
          )}
        </div>
      </div>
      
      {showSubtitle && subtitleText !== 'Intelligent ATS' && (
        <div style={{ 
          fontSize: currentSize.subtitleSize, 
          color: 'rgba(148,163,184,0.7)', 
          fontWeight: 600, 
          letterSpacing: '1.5px', 
          textTransform: 'uppercase', 
          marginTop: '12px',
          textAlign: 'center',
          width: '100%'
        }}>
          {subtitleText}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none', display: 'inline-block' }} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return <div style={{ display: 'inline-block', cursor: onClick ? 'pointer' : 'default' }}>{content}</div>;
};
