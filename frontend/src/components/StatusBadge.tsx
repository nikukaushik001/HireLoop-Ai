import React from 'react';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let badgeClass = 'badge-indigo';
  
  switch (status.toUpperCase()) {
    case 'OPEN':
    case 'NEW':
      badgeClass = 'badge-emerald';
      break;
    case 'CLOSED':
    case 'REJECTED':
    case 'NO_HIRE':
      badgeClass = 'badge-rose';
      break;
    case 'DRAFT':
    case 'SHORTLISTED':
    case 'INTERVIEWING':
      badgeClass = 'badge-amber';
      break;
    case 'OFFERED':
    case 'STRONG_HIRE':
    case 'HIRE':
    case 'COMPLETED':
      badgeClass = 'badge-indigo';
      break;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
