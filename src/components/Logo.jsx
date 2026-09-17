import React, { memo } from "react";

function Logo({ className = "w-8 h-8" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="aetheris-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Hexagon Frame */}
      <path 
        d="M20 6 L33 13.5 L33 28.5 L20 36 L7 28.5 L7 13.5 Z" 
        stroke="url(#aetheris-grad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#logo-glow)"
      />
      
      {/* Inner Energy Core */}
      <circle cx="20" cy="21" r="3.5" fill="#c084fc" />
      <circle cx="20" cy="21" r="7" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    </svg>
  );
}

export default memo(Logo);