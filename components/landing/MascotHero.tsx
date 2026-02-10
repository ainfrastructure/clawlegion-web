'use client'

import Image from 'next/image'

export function MascotHero() {
  return (
    <div className="mascot-hero-wrapper">
      <style>{`
        @keyframes mascotBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes caesarBob {
          0%, 100% { transform: translateY(0px) scale(1.2); }
          50% { transform: translateY(-12px) scale(1.2); }
        }
        
        @keyframes athenaBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes vulcanBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes connectionBeam {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .mascot-hero-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          width: 100%;
          height: 280px;
        }

        .avatar-container {
          position: relative;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .caesar-container {
          width: 140px;
          height: 140px;
          animation: caesarBob 4s ease-in-out infinite;
          z-index: 3;
          position: relative;
          margin: 0 60px;
        }

        .athena-container {
          width: 100px;
          height: 100px;
          animation: athenaBob 3.8s ease-in-out infinite 0.5s;
          z-index: 2;
          position: relative;
        }

        .vulcan-container {
          width: 100px;
          height: 100px;
          animation: vulcanBob 3.8s ease-in-out infinite 1.2s;
          z-index: 2;
          position: relative;
        }

        .avatar-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          animation: glowPulse 3s ease-in-out infinite;
          z-index: -1;
        }

        .caesar-glow {
          background: radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(245, 158, 11, 0.4) 50%, transparent 70%);
          box-shadow: 0 0 40px rgba(220, 38, 38, 0.5), 0 0 80px rgba(245, 158, 11, 0.3);
        }

        .athena-glow {
          background: radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, transparent 70%);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.5);
        }

        .vulcan-glow {
          background: radial-gradient(circle, rgba(245, 158, 11, 0.6) 0%, transparent 70%);
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
        }

        .avatar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid;
          z-index: -1;
        }

        .caesar-ring {
          border-color: rgba(220, 38, 38, 0.8);
          background: radial-gradient(circle, transparent 60%, rgba(220, 38, 38, 0.1) 100%);
        }

        .athena-ring {
          border-color: rgba(6, 182, 212, 0.8);
          background: radial-gradient(circle, transparent 60%, rgba(6, 182, 212, 0.1) 100%);
        }

        .vulcan-ring {
          border-color: rgba(245, 158, 11, 0.8);
          background: radial-gradient(circle, transparent 60%, rgba(245, 158, 11, 0.1) 100%);
        }

        .connection-beam {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
          top: 50%;
          transform: translateY(-50%);
          animation: connectionBeam 4s ease-in-out infinite;
          z-index: 1;
        }

        .beam-left {
          left: 100px;
          width: 60px;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.3), rgba(220, 38, 38, 0.3));
        }

        .beam-right {
          right: 100px;
          width: 60px;
          background: linear-gradient(90deg, rgba(220, 38, 38, 0.3), rgba(245, 158, 11, 0.3));
        }

        .avatar-image {
          border-radius: 50%;
          object-fit: cover;
          filter: brightness(1.1) contrast(1.1);
        }

        /* Responsive scaling */
        @media (max-width: 768px) {
          .mascot-hero-wrapper {
            height: 200px;
          }
          
          .caesar-container {
            width: 100px;
            height: 100px;
            margin: 0 40px;
          }
          
          .athena-container,
          .vulcan-container {
            width: 75px;
            height: 75px;
          }
          
          .beam-left,
          .beam-right {
            width: 40px;
          }
          
          .beam-left {
            left: 75px;
          }
          
          .beam-right {
            right: 75px;
          }
        }

        @media (max-width: 480px) {
          .mascot-hero-wrapper {
            height: 160px;
          }
          
          .caesar-container {
            width: 80px;
            height: 80px;
            margin: 0 30px;
          }
          
          .athena-container,
          .vulcan-container {
            width: 60px;
            height: 60px;
          }
          
          .beam-left,
          .beam-right {
            width: 30px;
          }
          
          .beam-left {
            left: 60px;
          }
          
          .beam-right {
            right: 60px;
          }
        }
      `}</style>
      
      <div className="flex items-center justify-center relative">
        {/* Connection beams */}
        <div className="connection-beam beam-left"></div>
        <div className="connection-beam beam-right"></div>
        
        {/* Athena - Left */}
        <div className="avatar-container athena-container">
          <div className="avatar-glow athena-glow"></div>
          <div className="avatar-ring athena-ring"></div>
          <Image
            src="/agents/athena.png"
            alt="Athena AI Agent"
            width={100}
            height={100}
            className="avatar-image"
            priority
          />
        </div>

        {/* Caesar - Center (Largest) */}
        <div className="avatar-container caesar-container">
          <div className="avatar-glow caesar-glow"></div>
          <div className="avatar-ring caesar-ring"></div>
          <Image
            src="/agents/caesar.png"
            alt="Caesar AI Agent"
            width={140}
            height={140}
            className="avatar-image"
            priority
          />
        </div>

        {/* Vulcan - Right */}
        <div className="avatar-container vulcan-container">
          <div className="avatar-glow vulcan-glow"></div>
          <div className="avatar-ring vulcan-ring"></div>
          <Image
            src="/agents/vulcan.png"
            alt="Vulcan AI Agent"
            width={100}
            height={100}
            className="avatar-image"
            priority
          />
        </div>
      </div>
    </div>
  )
}