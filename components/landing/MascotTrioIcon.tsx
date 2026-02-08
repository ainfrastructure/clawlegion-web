export function MascotTrioIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="mtBodyGrad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="60%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1e40af"/>
        </radialGradient>
        <filter id="mtEyeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="mtHornGrad" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#2563eb"/>
          <stop offset="100%" stopColor="#1e3a8a"/>
        </linearGradient>
      </defs>

      {/* Left mini */}
      <g>
        <circle cx="22" cy="52" r="18" fill="url(#mtBodyGrad)"/>
        <path d="M16,36 Q15,30 12,24" stroke="url(#mtHornGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M28,36 Q29,30 32,24" stroke="url(#mtHornGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="17" cy="51" r="2.5" fill="#00d4c8" filter="url(#mtEyeGlow)"/>
        <circle cx="27" cy="51" r="2.5" fill="#00d4c8" filter="url(#mtEyeGlow)"/>
        <circle cx="16.5" cy="50.5" r="1" fill="#40fff0" opacity="0.7"/>
        <circle cx="26.5" cy="50.5" r="1" fill="#40fff0" opacity="0.7"/>
        {/* Claws */}
        <ellipse cx="2" cy="52" rx="4" ry="3" fill="#2563eb"/>
        <ellipse cx="42" cy="52" rx="4" ry="3" fill="#2563eb"/>
      </g>

      {/* Right mini */}
      <g>
        <circle cx="98" cy="52" r="18" fill="url(#mtBodyGrad)"/>
        <path d="M92,36 Q91,30 88,24" stroke="url(#mtHornGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M104,36 Q105,30 108,24" stroke="url(#mtHornGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="93" cy="51" r="2.5" fill="#00d4c8" filter="url(#mtEyeGlow)"/>
        <circle cx="103" cy="51" r="2.5" fill="#00d4c8" filter="url(#mtEyeGlow)"/>
        <circle cx="92.5" cy="50.5" r="1" fill="#40fff0" opacity="0.7"/>
        <circle cx="102.5" cy="50.5" r="1" fill="#40fff0" opacity="0.7"/>
        {/* Claws */}
        <ellipse cx="78" cy="52" rx="4" ry="3" fill="#2563eb"/>
        <ellipse cx="118" cy="52" rx="4" ry="3" fill="#2563eb"/>
      </g>

      {/* Main (center, larger) */}
      <g>
        <circle cx="60" cy="48" r="26" fill="url(#mtBodyGrad)"/>
        <path d="M52,26 Q50,18 46,10" stroke="url(#mtHornGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M68,26 Q70,18 74,10" stroke="url(#mtHornGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="53" cy="46" r="3.5" fill="#00d4c8" filter="url(#mtEyeGlow)"/>
        <circle cx="67" cy="46" r="3.5" fill="#00d4c8" filter="url(#mtEyeGlow)"/>
        <circle cx="52.5" cy="45.5" r="1.5" fill="#40fff0" opacity="0.7"/>
        <circle cx="66.5" cy="45.5" r="1.5" fill="#40fff0" opacity="0.7"/>
        {/* Legs */}
        <rect x="52" y="72" width="5" height="8" rx="2" fill="#2563eb"/>
        <rect x="63" y="72" width="5" height="8" rx="2" fill="#2563eb"/>
      </g>
    </svg>
  )
}
