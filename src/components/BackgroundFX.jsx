import React from "react";

export default function BackgroundFX() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Amethyst Aura */}
      <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-purple-600/15 via-fuchsia-600/5 to-transparent blur-[140px] rounded-full" />
      
      {/* Left Subtle Glow */}
      <div className="absolute top-[30%] -left-[150px] w-[500px] h-[500px] bg-purple-900/10 blur-[130px] rounded-full" />
      
      {/* Bottom Right Electric Accent */}
      <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px] bg-indigo-600/10 blur-[120px] rounded-full" />
      
      {/* Precision Grid Layer */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}