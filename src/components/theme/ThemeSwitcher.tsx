'use client';

import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);

  // Erst nach dem Client-Rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wenn nicht gemounted, ein leeres div rendern
  if (!mounted) {
    return <div className="theme-switch-placeholder"></div>;
  }

  return (
    <button
      aria-label="Theme Switch"
      className="theme-switch"
      onClick={() => {}}
    >
      <div className="theme-switch-handle">
        ☀️
      </div>
    </button>
  );
} 