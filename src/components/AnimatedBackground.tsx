import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  type?: 'gradient' | 'stars' | 'waves' | 'particles';
  mood?: string;
}

export default function AnimatedBackground({ type = 'gradient', mood = 'happy' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrame: number;

    if (type === 'stars') {
      const stars: { x: number; y: number; size: number; speed: number }[] = [];
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speed: Math.random() * 0.5 + 0.1,
        });
      }

      const animate = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();

          star.y += star.speed;
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        });

        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    } else if (type === 'particles') {
      const particles: { x: number; y: number; vx: number; vy: number; size: number; hue: number }[] = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 4 + 2,
          hue: Math.random() * 360,
        });
      }

      const animate = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.6)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  const getGradientClass = () => {
    if (type === 'gradient') {
      switch (mood) {
        case 'happy': return 'bg-gradient-to-br from-amber-200 via-pink-200 to-purple-300';
        case 'sad': return 'bg-gradient-to-br from-blue-300 via-indigo-300 to-blue-400';
        case 'excited': return 'bg-gradient-to-br from-orange-300 via-red-300 to-pink-400';
        case 'calm': return 'bg-gradient-to-br from-teal-200 via-cyan-200 to-blue-300';
        case 'angry': return 'bg-gradient-to-br from-red-400 via-orange-400 to-red-500';
        default: return 'gradient-bg-1';
      }
    }
    return '';
  };

  if (type === 'gradient') {
    return <div className={`fixed inset-0 -z-10 ${getGradientClass()} animate-gradient`} />;
  }

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}
