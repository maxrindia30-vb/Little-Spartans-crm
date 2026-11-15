import React, { useState, useRef } from 'react';

/**
 * FloatingCard - High-Performance 3D Floating Physics Card
 *
 * Tracks mouse position over the card surface, applies smooth 3D tilt,
 * levitation elevation (translateY), dynamic specular spotlight glare,
 * and gentle spring-back physics when the mouse leaves.
 */
export default function FloatingCard({
  children,
  className = '',
  contentClassName = '',
  maxTilt = 7,
  scale = 1.02,
  glare = true,
  onClick,
  style = {}
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1

    // Calculate rotation: center is 0, edges are ±maxTilt degrees
    const rotateX = (0.5 - y) * (maxTilt * 2);
    const rotateY = (x - 0.5) * (maxTilt * 2);

    setTilt({
      rotateX: Number(rotateX.toFixed(2)),
      rotateY: Number(rotateY.toFixed(2)),
      glareX: Number((x * 100).toFixed(1)),
      glareY: Number((y * 100).toFixed(1)),
      isHovered: true
    });
  };

  const handleMouseEnter = () => {
    setTilt((prev) => ({ ...prev, isHovered: true }));
  };

  const handleMouseLeave = () => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false
    });
  };

  const transformStyle = tilt.isHovered
    ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-6px) scale(${scale})`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl transition-all select-none will-change-transform ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        transform: transformStyle,
        transition: tilt.isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.15s ease-out'
          : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease',
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      {/* Dynamic Specular Spotlight Glare */}
      {glare && tilt.isHovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl z-20 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(244, 81, 11, 0.06) 45%, transparent 75%)`
          }}
        />
      )}

      {/* Card Content with subtle 3D lift */}
      <div 
        className={`h-full ${contentClassName}`}
        style={{ transform: tilt.isHovered ? 'translateZ(10px)' : 'translateZ(0px)', transition: 'transform 0.2s ease' }}
      >
        {children}
      </div>
    </div>
  );
}
