import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles
    const colors = [
      'hsl(280 75% 65%)',   // primary purple
      'hsl(320 75% 70%)',   // rose
      'hsl(280 85% 75%)',   // light purple glow
      'hsl(260 70% 72%)',   // deep purple
      'hsl(290 70% 75%)',   // violet
    ];

    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px ${particle.color}`,
            animation: `floatParticle ${particle.duration}s ease-in-out ${particle.delay}s infinite, sparkle ${particle.duration / 2}s ease-in-out ${particle.delay}s infinite`,
            opacity: 0.6,
          }}
        />
      ))}
      
      {/* Larger glowing stars */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `starTwinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L14.09 8.26L20 10.27L15.18 15.14L16.18 21.02L12 18.27L7.82 21.02L8.82 15.14L4 10.27L9.91 8.26L12 2Z"
              fill="hsl(280 75% 70%)"
              opacity="0.4"
              style={{
                filter: 'drop-shadow(0 0 8px hsl(280 75% 70%))',
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
