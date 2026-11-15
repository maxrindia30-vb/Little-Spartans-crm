import React, { useEffect, useState } from 'react';

/**
 * MouseFloatingGlow - Smooth ambient mouse-following floating light
 * Gives a modern, high-end floating cursor effect across the CRM canvas.
 */
export default function MouseFloatingGlow() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animId;
    let targetX = -300;
    let targetY = -300;
    let currentX = -300;
    let currentY = -300;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const updatePosition = () => {
      // Smooth linear interpolation for gentle floating lag physics
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      const glowEl = document.getElementById('mouse-floating-ambient-orb');
      if (glowEl) {
        glowEl.style.transform = `translate3d(${currentX - 175}px, ${currentY - 175}px, 0)`;
      }

      animId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  return (
    <div
      id="mouse-floating-ambient-orb"
      aria-hidden="true"
      className={`pointer-events-none fixed top-0 left-0 w-[350px] h-[350px] rounded-full z-0 transition-opacity duration-300 ${
        isVisible ? 'opacity-35' : 'opacity-0'
      }`}
      style={{
        background: 'radial-gradient(circle, rgba(244, 81, 11, 0.12) 0%, rgba(23, 43, 80, 0.05) 45%, transparent 70%)',
        willChange: 'transform',
        filter: 'blur(30px)'
      }}
    />
  );
}
