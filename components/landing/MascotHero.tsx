'use client'

import Image from 'next/image'

export function MascotHero() {
  return (
    <div className="mascot-hero-wrapper">
      <style>{`
        @keyframes heroBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes heroGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .mascot-hero-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          width: 100%;
          height: 300px;
        }

        .council-hero-container {
          position: relative;
          animation: heroBob 4s ease-in-out infinite;
        }

        .council-hero-glow {
          position: absolute;
          inset: -30px;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center,
            rgba(220, 38, 38, 0.2) 0%,
            rgba(6, 182, 212, 0.12) 35%,
            rgba(67, 56, 202, 0.1) 55%,
            transparent 75%
          );
          animation: heroGlow 3s ease-in-out infinite;
          z-index: -1;
          filter: blur(20px);
        }

        .council-hero-image {
          filter: brightness(1.05) contrast(1.05);
        }

        @media (max-width: 768px) {
          .mascot-hero-wrapper {
            height: 220px;
          }
        }

        @media (max-width: 480px) {
          .mascot-hero-wrapper {
            height: 180px;
          }
        }
      `}</style>

      <div className="council-hero-container">
        <div className="council-hero-glow" />
        <Image
          src="/agents/council-hero.png"
          alt="Caesar, Athena and Vulcan — The AI Council"
          width={340}
          height={260}
          className="council-hero-image"
          priority
          style={{ width: 'auto', height: 'auto', maxWidth: '340px', maxHeight: '260px' }}
          sizes="(max-width: 480px) 220px, (max-width: 768px) 280px, 340px"
        />
      </div>
    </div>
  )
}
