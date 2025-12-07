import React from 'react';

interface URockLogoProps {
  className?: string;
}

export const URockLogo: React.FC<URockLogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="splitGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {/* Outer rim */}
      <circle cx="50" cy="50" r="48" fill="url(#splitGradient)" stroke="#cbd5e1" strokeWidth="2" />
      
      {/* Inner black circle */}
      <circle cx="50" cy="50" r="38" fill="#0f172a" />
      
      {/* Text */}
      <text x="50" y="48" textAnchor="middle" fill="#ef4444" fontSize="38" fontWeight="900" fontFamily="sans-serif" style={{ filter: 'drop-shadow(2px 2px 0px #fff)' }}>U</text>
      <text x="50" y="72" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">ROCK!</text>
    </svg>
  );
};