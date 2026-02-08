export function MascotHero() {
  return (
    <div className="mascot-hero-wrapper">
      <style>{`
        @keyframes mascotBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes eyeGlowPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes eyeGlowOuter {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.45; }
        }
        @keyframes mascotBlink {
          0%, 92%, 100% { opacity: 0; }
          95%, 97% { opacity: 1; }
        }
        @keyframes antennaSwayL {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes antennaSwayR {
          0%, 100% { transform: rotate(1.5deg); }
          50% { transform: rotate(-1.5deg); }
        }
        @keyframes clawIdleL {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes clawIdleR {
          0%, 100% { transform: rotate(2deg); }
          50% { transform: rotate(-2deg); }
        }
        .mascot-hero-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .mascot-hero-wrapper svg {
          width: 340px;
          height: auto;
        }
        .mascot-main {
          animation: mascotBob 4s ease-in-out infinite;
        }
        @keyframes miniLeftBob {
          0%, 100% { transform: translate(-75px, 70px) scale(0.5); }
          50% { transform: translate(-75px, 66px) scale(0.5); }
        }
        @keyframes miniRightBob {
          0%, 100% { transform: translate(320px, 70px) scale(0.5); }
          50% { transform: translate(320px, 66px) scale(0.5); }
        }
        .mascot-mini-left {
          animation: miniLeftBob 3.8s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .mascot-mini-right {
          animation: miniRightBob 3.8s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        .mascot-eye-inner {
          animation: eyeGlowPulse 3s ease-in-out infinite;
        }
        .mascot-eye-outer {
          animation: eyeGlowOuter 3s ease-in-out infinite;
        }
        .mascot-blink {
          animation: mascotBlink 5s ease-in-out infinite;
        }
        .mascot-antenna-l {
          transform-origin: 215px 140px;
          animation: antennaSwayL 3.5s ease-in-out infinite;
        }
        .mascot-antenna-r {
          transform-origin: 285px 140px;
          animation: antennaSwayR 3.5s ease-in-out infinite;
        }
        .mascot-claw-upper-l {
          transform-origin: 52px 261px;
          animation: clawIdleL 2.8s ease-in-out infinite;
        }
        .mascot-claw-lower-l {
          transform-origin: 52px 261px;
          animation: clawIdleR 2.8s ease-in-out infinite;
        }
        .mascot-claw-upper-r {
          transform-origin: 448px 261px;
          animation: clawIdleR 2.8s ease-in-out infinite;
        }
        .mascot-claw-lower-r {
          transform-origin: 448px 261px;
          animation: clawIdleL 2.8s ease-in-out infinite;
        }
      `}</style>
      <svg viewBox="-120 30 740 450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Body glow filter */}
          <filter id="mhBodyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur"/>
            <feColorMatrix in="blur" type="matrix"
              values="0 0 0 0 0.1
                      0 0 0.4 0 0
                      0 0 0 0 0.2
                      0 0 0 0.4 0" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Eye glow filter */}
          <filter id="mhEyeGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2"/>
            <feMerge>
              <feMergeNode in="blur2"/>
              <feMergeNode in="blur1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Body gradient — blue */}
          <radialGradient id="mhBodyGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="60%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1e40af"/>
          </radialGradient>

          {/* Claw gradient — darker blue */}
          <radialGradient id="mhClawGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#1e3a8a"/>
          </radialGradient>

          {/* Horn gradient — blue */}
          <linearGradient id="mhHornGrad" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#2563eb"/>
            <stop offset="70%" stopColor="#1e40af"/>
            <stop offset="100%" stopColor="#1e3a8a"/>
          </linearGradient>

          {/* Leg gradient — blue */}
          <radialGradient id="mhLegGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1d4ed8"/>
          </radialGradient>
        </defs>

        {/* --- Left mini mascot --- */}
        <g className="mascot-mini-left" transform="translate(-75, 70) scale(0.5)">
          <rect x="185" y="390" width="32" height="50" rx="10" fill="url(#mhLegGrad)"/>
          <ellipse cx="201" cy="440" rx="20" ry="10" fill="url(#mhLegGrad)"/>
          <rect x="283" y="390" width="32" height="50" rx="10" fill="url(#mhLegGrad)"/>
          <ellipse cx="299" cy="440" rx="20" ry="10" fill="url(#mhLegGrad)"/>
          <rect x="60" y="256" width="50" height="10" rx="5" fill="url(#mhClawGrad)"/>
          <path d="M58,252 C54,240 44,224 30,220 C16,216 4,224 4,238 C4,248 10,254 20,257 L58,258 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M58,270 C54,282 44,298 30,302 C16,306 4,298 4,284 C4,274 10,268 20,265 L58,264 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M50,257 L46,254 L42,258 L38,254 L34,258 L30,254 L26,257" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M50,265 L46,268 L42,264 L38,268 L34,264 L30,268 L26,265" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="52" cy="261" rx="12" ry="14" fill="url(#mhClawGrad)"/>
          <rect x="390" y="256" width="50" height="10" rx="5" fill="url(#mhClawGrad)"/>
          <path d="M442,252 C446,240 456,224 470,220 C484,216 496,224 496,238 C496,248 490,254 480,257 L442,258 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M442,270 C446,282 456,298 470,302 C484,306 496,298 496,284 C496,274 490,268 480,265 L442,264 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M450,257 L454,254 L458,258 L462,254 L466,258 L470,254 L474,257" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M450,265 L454,268 L458,264 L462,268 L466,264 L470,268 L474,265" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="448" cy="261" rx="12" ry="14" fill="url(#mhClawGrad)"/>
          <circle cx="250" cy="260" r="145" fill="url(#mhBodyGrad)"/>
          <path d="M210,140 Q205,110 185,70 Q182,60 190,68 Q208,95 218,135 Z" fill="url(#mhHornGrad)"/>
          <path d="M290,140 Q295,110 315,70 Q318,60 310,68 Q292,95 282,135 Z" fill="url(#mhHornGrad)"/>
          <circle cx="215" cy="255" r="10" fill="#00d4c8" opacity="0.3" filter="url(#mhEyeGlow)"/>
          <circle cx="215" cy="255" r="8" fill="#00d4c8"/>
          <circle cx="215" cy="253" r="4" fill="#40fff0" opacity="0.6"/>
          <circle cx="285" cy="255" r="10" fill="#00d4c8" opacity="0.3" filter="url(#mhEyeGlow)"/>
          <circle cx="285" cy="255" r="8" fill="#00d4c8"/>
          <circle cx="285" cy="253" r="4" fill="#40fff0" opacity="0.6"/>
        </g>

        {/* --- Right mini mascot --- */}
        <g className="mascot-mini-right" transform="translate(320, 70) scale(0.5)">
          <rect x="185" y="390" width="32" height="50" rx="10" fill="url(#mhLegGrad)"/>
          <ellipse cx="201" cy="440" rx="20" ry="10" fill="url(#mhLegGrad)"/>
          <rect x="283" y="390" width="32" height="50" rx="10" fill="url(#mhLegGrad)"/>
          <ellipse cx="299" cy="440" rx="20" ry="10" fill="url(#mhLegGrad)"/>
          <rect x="60" y="256" width="50" height="10" rx="5" fill="url(#mhClawGrad)"/>
          <path d="M58,252 C54,240 44,224 30,220 C16,216 4,224 4,238 C4,248 10,254 20,257 L58,258 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M58,270 C54,282 44,298 30,302 C16,306 4,298 4,284 C4,274 10,268 20,265 L58,264 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M50,257 L46,254 L42,258 L38,254 L34,258 L30,254 L26,257" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M50,265 L46,268 L42,264 L38,268 L34,264 L30,268 L26,265" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="52" cy="261" rx="12" ry="14" fill="url(#mhClawGrad)"/>
          <rect x="390" y="256" width="50" height="10" rx="5" fill="url(#mhClawGrad)"/>
          <path d="M442,252 C446,240 456,224 470,220 C484,216 496,224 496,238 C496,248 490,254 480,257 L442,258 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M442,270 C446,282 456,298 470,302 C484,306 496,298 496,284 C496,274 490,268 480,265 L442,264 Z" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
          <path d="M450,257 L454,254 L458,258 L462,254 L466,258 L470,254 L474,257" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M450,265 L454,268 L458,264 L462,268 L466,264 L470,268 L474,265" stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="448" cy="261" rx="12" ry="14" fill="url(#mhClawGrad)"/>
          <circle cx="250" cy="260" r="145" fill="url(#mhBodyGrad)"/>
          <path d="M210,140 Q205,110 185,70 Q182,60 190,68 Q208,95 218,135 Z" fill="url(#mhHornGrad)"/>
          <path d="M290,140 Q295,110 315,70 Q318,60 310,68 Q292,95 282,135 Z" fill="url(#mhHornGrad)"/>
          <circle cx="215" cy="255" r="10" fill="#00d4c8" opacity="0.3" filter="url(#mhEyeGlow)"/>
          <circle cx="215" cy="255" r="8" fill="#00d4c8"/>
          <circle cx="215" cy="253" r="4" fill="#40fff0" opacity="0.6"/>
          <circle cx="285" cy="255" r="10" fill="#00d4c8" opacity="0.3" filter="url(#mhEyeGlow)"/>
          <circle cx="285" cy="255" r="8" fill="#00d4c8"/>
          <circle cx="285" cy="253" r="4" fill="#40fff0" opacity="0.6"/>
        </g>

        {/* --- Main character --- */}
        <g className="mascot-main">
          {/* Left leg */}
          <rect x="185" y="390" width="32" height="50" rx="10" fill="url(#mhLegGrad)"/>
          <ellipse cx="201" cy="440" rx="20" ry="10" fill="url(#mhLegGrad)"/>

          {/* Right leg */}
          <rect x="283" y="390" width="32" height="50" rx="10" fill="url(#mhLegGrad)"/>
          <ellipse cx="299" cy="440" rx="20" ry="10" fill="url(#mhLegGrad)"/>

          {/* Left claw arm */}
          <g>
            <rect x="60" y="256" width="50" height="10" rx="5" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="0.5"/>
            <g>
              {/* Upper claw half */}
              <g className="mascot-claw-upper-l">
                <path d="M58,252 C54,240 44,224 30,220 C16,216 4,224 4,238 C4,248 10,254 20,257 L58,258 Z"
                      fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
                <path d="M40,230 C34,226 24,226 18,232" stroke="#60a5fa" strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round"/>
                <path d="M50,257 L46,254 L42,258 L38,254 L34,258 L30,254 L26,257 L22,254 L18,257"
                      stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              {/* Lower claw half */}
              <g className="mascot-claw-lower-l">
                <path d="M58,270 C54,282 44,298 30,302 C16,306 4,298 4,284 C4,274 10,268 20,265 L58,264 Z"
                      fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
                <path d="M40,292 C34,296 24,296 18,290" stroke="#60a5fa" strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round"/>
                <path d="M50,265 L46,268 L42,264 L38,268 L34,264 L30,268 L26,265 L22,268 L18,265"
                      stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <ellipse cx="52" cy="261" rx="12" ry="14" fill="url(#mhClawGrad)"/>
              <ellipse cx="48" cy="255" rx="8" ry="6" fill="#60a5fa" opacity="0.25"/>
            </g>
          </g>

          {/* Right claw arm */}
          <g>
            <rect x="390" y="256" width="50" height="10" rx="5" fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="0.5"/>
            <g>
              {/* Upper claw half */}
              <g className="mascot-claw-upper-r">
                <path d="M442,252 C446,240 456,224 470,220 C484,216 496,224 496,238 C496,248 490,254 480,257 L442,258 Z"
                      fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
                <path d="M460,230 C466,226 476,226 482,232" stroke="#60a5fa" strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round"/>
                <path d="M450,257 L454,254 L458,258 L462,254 L466,258 L470,254 L474,257 L478,254 L482,257"
                      stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              {/* Lower claw half */}
              <g className="mascot-claw-lower-r">
                <path d="M442,270 C446,282 456,298 470,302 C484,306 496,298 496,284 C496,274 490,268 480,265 L442,264 Z"
                      fill="url(#mhClawGrad)" stroke="#1e3a8a" strokeWidth="1"/>
                <path d="M460,292 C466,296 476,296 482,290" stroke="#60a5fa" strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round"/>
                <path d="M450,265 L454,268 L458,264 L462,268 L466,264 L470,268 L474,265 L478,268 L482,265"
                      stroke="#1e3a8a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <ellipse cx="448" cy="261" rx="12" ry="14" fill="url(#mhClawGrad)"/>
              <ellipse cx="452" cy="255" rx="8" ry="6" fill="#60a5fa" opacity="0.25"/>
            </g>
          </g>

          {/* Body */}
          <g filter="url(#mhBodyGlow)">
            <circle cx="250" cy="260" r="145" fill="url(#mhBodyGrad)"/>
          </g>

          {/* Left horn/antenna */}
          <g className="mascot-antenna-l">
            <path d="M210,140 Q205,110 185,70 Q182,60 190,68 Q208,95 218,135 Z" fill="url(#mhHornGrad)"/>
            <path d="M185,70 Q183,63 186,66 Q188,72 185,70 Z" fill="#1e3a8a"/>
            <line x1="208" y1="130" x2="192" y2="80" stroke="#1d4ed8" strokeWidth="0.6" opacity="0.4"/>
          </g>

          {/* Right horn/antenna */}
          <g className="mascot-antenna-r">
            <path d="M290,140 Q295,110 315,70 Q318,60 310,68 Q292,95 282,135 Z" fill="url(#mhHornGrad)"/>
            <path d="M315,70 Q317,63 314,66 Q312,72 315,70 Z" fill="#1e3a8a"/>
            <line x1="292" y1="130" x2="308" y2="80" stroke="#1d4ed8" strokeWidth="0.6" opacity="0.4"/>
          </g>

          {/* Eyes */}
          <g>
            {/* Left eye */}
            <circle cx="215" cy="255" r="16" fill="#00d4c8" opacity="0.3" filter="url(#mhEyeGlow)" className="mascot-eye-outer"/>
            <circle cx="215" cy="255" r="12" fill="#00d4c8" className="mascot-eye-inner"/>
            <circle cx="215" cy="253" r="6" fill="#40fff0" opacity="0.6"/>
            <circle cx="211" cy="250" r="3" fill="#ffffff" opacity="0.5"/>

            {/* Right eye */}
            <circle cx="285" cy="255" r="16" fill="#00d4c8" opacity="0.3" filter="url(#mhEyeGlow)" className="mascot-eye-outer"/>
            <circle cx="285" cy="255" r="12" fill="#00d4c8" className="mascot-eye-inner"/>
            <circle cx="285" cy="253" r="6" fill="#40fff0" opacity="0.6"/>
            <circle cx="281" cy="250" r="3" fill="#ffffff" opacity="0.5"/>
          </g>

          {/* Blink overlay */}
          <g className="mascot-blink">
            <ellipse cx="215" cy="255" rx="16" ry="16" fill="#3b82f6"/>
            <ellipse cx="285" cy="255" rx="16" ry="16" fill="#3b82f6"/>
          </g>
        </g>
      </svg>
    </div>
  )
}
