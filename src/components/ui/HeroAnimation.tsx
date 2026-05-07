import React from 'react';

export default function HeroAnimation() {
  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
      {/* CSS Animations for the SVG */}
      <style>{`
        @keyframes floatDesk {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes typeCode {
          0% { width: 0; opacity: 1; }
          50% { width: 100%; opacity: 1; }
          100% { width: 0; opacity: 0.2; }
        }
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes subtleMove {
          0% { transform: rotate(0deg) translate(0, 0); }
          50% { transform: rotate(1deg) translate(2px, 2px); }
          100% { transform: rotate(0deg) translate(0, 0); }
        }
        @keyframes glowScreen {
          0% { filter: drop-shadow(0 0 10px rgba(62, 201, 139, 0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(62, 201, 139, 0.8)); }
          100% { filter: drop-shadow(0 0 10px rgba(62, 201, 139, 0.4)); }
        }
        .anim-desk-group { animation: floatDesk 8s ease-in-out infinite; }
        .anim-character { animation: subtleMove 4s ease-in-out infinite; transform-origin: center bottom; }
        .code-line { stroke-dasharray: 100; stroke-dashoffset: 100; animation: dashCode 3s linear infinite; }
        @keyframes dashCode {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* 
        The user wants the desk on the right. 
        Since we are in RTL, "right" visually is the start, but we'll align the SVG contents to the right side of its viewBox.
      */}
      <svg viewBox="0 0 800 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gradients */}
          <linearGradient id="screen-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg3)" />
            <stop offset="100%" stopColor="#1a2530" />
          </linearGradient>
          <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
          <radialGradient id="monitor-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(62, 201, 139, 0.15)" />
            <stop offset="100%" stopColor="rgba(62, 201, 139, 0)" />
          </radialGradient>
        </defs>

        <g className="anim-desk-group">
          {/* Background Glow from Monitors */}
          <ellipse cx="550" cy="250" rx="200" ry="200" fill="url(#monitor-light)" />

          {/* === DESK (Right Side) === */}
          {/* Desk Base/Legs */}
          <rect x="400" y="450" width="15" height="150" fill="var(--bg4)" rx="5" />
          <rect x="750" y="450" width="15" height="150" fill="var(--bg4)" rx="5" />
          <path d="M400,550 L750,550" stroke="var(--bg3)" strokeWidth="8" />
          {/* Desk Top */}
          <path d="M380,430 L780,430 L760,450 L400,450 Z" fill="#2d271c" />
          <rect x="380" y="450" width="400" height="10" fill="var(--accent)" rx="3" />

          {/* === CHAIR === */}
          <g transform="translate(480, 320)">
            {/* Chair Base */}
            <rect x="55" y="180" width="10" height="80" fill="#333" />
            <path d="M20,260 L100,260" stroke="#444" strokeWidth="8" strokeLinecap="round" />
            <circle cx="20" cy="265" r="8" fill="#222" />
            <circle cx="100" cy="265" r="8" fill="#222" />
            {/* Seat */}
            <path d="M30,170 L90,170 L95,185 L25,185 Z" fill="var(--bg4)" />
            {/* Backrest */}
            <path d="M85,50 L95,170 L80,170 L70,50 Z" fill="var(--bg4)" />
            <rect x="65" y="30" width="25" height="40" rx="10" fill="var(--accent)" />
          </g>

          {/* === CHARACTER === */}
          <g className="anim-character" transform="translate(490, 240)">
            {/* Legs */}
            <path d="M50,130 L30,200 L10,200" stroke="#1c2337" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M60,130 L70,210 L50,210" stroke="#1c2337" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Body (Hoodie) */}
            <path d="M35,60 C20,90 20,130 35,140 L75,140 C90,130 90,90 75,60 Z" fill="var(--accent2)" />
            {/* Arms (Typing on keyboard) */}
            <path d="M45,70 L10,120 L-20,110" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M65,70 L30,115 L-10,120" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Head/Hair */}
            <circle cx="55" cy="40" r="25" fill="#f5c29f" />
            <path d="M30,40 C30,10 80,10 80,40 C80,25 30,25 30,40 Z" fill="#222" />
            {/* Headphones */}
            <path d="M30,40 C30,10 80,10 80,40" stroke="#fff" strokeWidth="4" fill="none" />
            <rect x="25" y="30" width="8" height="20" rx="4" fill="#333" />
            <rect x="77" y="30" width="8" height="20" rx="4" fill="#333" />
          </g>

          {/* === MONITORS === */}
          <g style={{ animation: 'glowScreen 4s infinite' }}>
            {/* Left Monitor (Vertical/Code) */}
            <g transform="translate(420, 220)">
              {/* Stand */}
              <rect x="45" y="160" width="10" height="50" fill="#444" />
              <path d="M30,210 L70,210" stroke="#555" strokeWidth="6" strokeLinecap="round" />
              {/* Screen */}
              <rect x="10" y="0" width="80" height="160" rx="5" fill="#111" stroke="#333" strokeWidth="4" />
              <rect x="15" y="5" width="70" height="150" fill="url(#screen-glow)" />
              
              {/* Code Lines Animation */}
              <g stroke="var(--green)" strokeWidth="3" strokeLinecap="round">
                <line x1="25" y1="20" x2="60" y2="20" className="code-line" style={{ animationDelay: '0.1s' }} />
                <line x1="25" y1="35" x2="70" y2="35" className="code-line" style={{ animationDelay: '0.3s', stroke: 'var(--gold)' }} />
                <line x1="35" y1="50" x2="65" y2="50" className="code-line" style={{ animationDelay: '0.5s' }} />
                <line x1="25" y1="65" x2="50" y2="65" className="code-line" style={{ animationDelay: '0.7s', stroke: 'var(--accent)' }} />
                <line x1="35" y1="80" x2="75" y2="80" className="code-line" style={{ animationDelay: '0.9s' }} />
                <line x1="25" y1="95" x2="55" y2="95" className="code-line" style={{ animationDelay: '1.1s', stroke: 'var(--gold)' }} />
                <line x1="25" y1="110" x2="45" y2="110" className="code-line" style={{ animationDelay: '1.3s' }} />
              </g>
            </g>

            {/* Right Monitor (Main Horizontal - Dashboard UI) */}
            <g transform="translate(520, 240)">
              {/* Stand */}
              <rect x="75" y="120" width="10" height="70" fill="#444" />
              <path d="M50,190 L110,190" stroke="#555" strokeWidth="6" strokeLinecap="round" />
              {/* Screen */}
              <rect x="0" y="0" width="160" height="120" rx="5" fill="#111" stroke="#333" strokeWidth="4" />
              <rect x="5" y="5" width="150" height="110" fill="url(#screen-glow)" />
              
              {/* Dashboard Elements */}
              <rect x="15" y="15" width="30" height="30" rx="4" fill="rgba(210, 95, 30, 0.3)" />
              <rect x="55" y="15" width="30" height="30" rx="4" fill="rgba(255, 185, 80, 0.3)" />
              <rect x="95" y="15" width="50" height="30" rx="4" fill="rgba(62, 201, 139, 0.3)" />
              
              <rect x="15" y="55" width="80" height="50" rx="4" fill="rgba(255, 255, 255, 0.05)" />
              <path d="M 20 95 L 40 70 L 60 85 L 85 60" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              <rect x="105" y="55" width="40" height="10" rx="2" fill="var(--accent)" />
              <rect x="105" y="75" width="30" height="10" rx="2" fill="var(--bg4)" />
              <rect x="105" y="95" width="35" height="10" rx="2" fill="var(--bg4)" />
            </g>
          </g>

          {/* Keyboard & Mouse on Desk */}
          <rect x="460" y="435" width="60" height="8" rx="2" fill="#222" transform="rotate(-15 460 435)" />
          <circle cx="530" cy="430" r="5" fill="#333" />
          
          {/* Coffee Mug */}
          <g transform="translate(680, 410)">
            <rect x="0" y="0" width="20" height="25" rx="2" fill="#fff" />
            <path d="M20,5 C25,5 25,15 20,15" fill="none" stroke="#fff" strokeWidth="3" />
            {/* Steam */}
            <path d="M5,-5 C5,-15 10,-10 10,-20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={{ animation: 'floatDesk 3s infinite' }} />
            <path d="M12,-2 C12,-12 17,-7 17,-17" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={{ animation: 'floatDesk 4s infinite 1s' }} />
          </g>

          {/* Floating UI Elements (Abstract) */}
          <g style={{ animation: 'floatDesk 6s infinite reverse' }}>
            <rect x="680" y="150" width="80" height="40" rx="8" fill="rgba(255, 255, 255, 0.05)" stroke="var(--border2)" />
            <circle cx="700" cy="170" r="8" fill="var(--green)" />
            <rect x="715" y="165" width="30" height="6" rx="3" fill="var(--text)" opacity="0.5" />
          </g>

          <g style={{ animation: 'floatDesk 5s infinite 2s' }}>
            <rect x="350" y="100" width="60" height="60" rx="12" fill="rgba(210, 95, 30, 0.1)" stroke="var(--accent)" strokeWidth="2" />
            <path d="M370,130 L375,135 L390,120" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>

        </g>
      </svg>
    </div>
  );
}
