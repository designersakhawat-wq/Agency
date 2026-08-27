import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CursorSpotlight = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const cursorX = useSpring(-100, { damping: 25, stiffness: 200 });
  const cursorY = useSpring(-100, { damping: 25, stiffness: 200 });

  useEffect(() => {
    // Only enable on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX - 175);
      cursorY.set(e.clientY - 175);
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-30 w-[350px] h-[350px] rounded-full mix-blend-screen opacity-30 blur-3xl hidden lg:block"
      style={{
        x: cursorX,
        y: cursorY,
        background:
          'radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, rgba(6, 182, 212, 0.15) 40%, transparent 70%)',
      }}
    />
  );
};

export default CursorSpotlight;
