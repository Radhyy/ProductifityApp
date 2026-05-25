"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Wait for 3 seconds, then start fading out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      
      // Remove from DOM 500ms after fade starts (duration of CSS transition)
      const removeTimer = setTimeout(() => {
        setShow(false);
      }, 500);

      return () => clearTimeout(removeTimer);
    }, 3000);

    return () => clearTimeout(fadeTimer);
  }, []);

  if (!show) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff', // changed to white as requested
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.5s ease-out',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto'
      }}
    >
      <img 
        src="/IconApllicationNoBg.png" 
        alt="Logo" 
        style={{
          width: '150px',
          height: '150px',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
