export function MascotIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="80 90 340 340"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="miBodyGrad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="60%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1e40af"/>
        </radialGradient>
        <filter id="miEyeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Body */}
      <circle cx="250" cy="260" r="145" fill="url(#miBodyGrad)"/>

      {/* Left eye */}
      <circle cx="215" cy="255" r="14" fill="#00d4c8" opacity="0.3" filter="url(#miEyeGlow)"/>
      <circle cx="215" cy="255" r="11" fill="#00d4c8"/>
      <circle cx="215" cy="253" r="5" fill="#40fff0" opacity="0.6"/>
      <circle cx="212" cy="250" r="2.5" fill="#ffffff" opacity="0.5"/>

      {/* Right eye */}
      <circle cx="285" cy="255" r="14" fill="#00d4c8" opacity="0.3" filter="url(#miEyeGlow)"/>
      <circle cx="285" cy="255" r="11" fill="#00d4c8"/>
      <circle cx="285" cy="253" r="5" fill="#40fff0" opacity="0.6"/>
      <circle cx="282" cy="250" r="2.5" fill="#ffffff" opacity="0.5"/>
    </svg>
  )
}
