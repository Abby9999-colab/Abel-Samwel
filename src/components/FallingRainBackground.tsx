import React, { useEffect, useState } from 'react';

interface Droplet {
  id: number;
  left: string;
  delay: string;
  duration: string;
  opacity: number;
}

export default function FallingRainBackground() {
  const [droplets, setDroplets] = useState<Droplet[]>([]);

  useEffect(() => {
    // Generate randomized droplet particles
    const dropletCount = 45;
    const items: Droplet[] = Array.from({ length: dropletCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 99}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${1.5 + Math.random() * 2.5}s`,
      opacity: 0.15 + Math.random() * 0.4
    }));
    setDroplets(items);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-40">
      {droplets.map((drop) => (
        <div
          key={drop.id}
          className="droplet-particle"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
}
