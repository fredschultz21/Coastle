"use client";

import { useState } from "react";

export default function Home() {
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newLeftWidth = (e.clientX / window.innerWidth) * 100;
    
    if (newLeftWidth > 10 && newLeftWidth < 90) {
      setLeftWidth(newLeftWidth);
    }
  };

  return (
    <div 
      className="flex h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        <div className="flex flex-col items-center gap-4">
          <img 
            src="https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/daily/zoom_7_2025-12-18T17-50-20-595Z.png"
            alt="Map"
            className="w-[960px] h-[540px] object-cover rounded-lg shadow-lg"
          />
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            © Mapbox © OpenStreetMap contributors © Maxar
          </p>
        </div>
      </div>

      <div
        className="w-1 bg-zinc-300 dark:bg-zinc-700 cursor-col-resize hover:bg-zinc-400 dark:hover:bg-zinc-600"
        onMouseDown={handleMouseDown}
      />

      <div 
        className="flex items-center justify-center bg-white dark:bg-black"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <p className="text-xl text-zinc-800 dark:text-zinc-200">
          Right Panel
        </p>
      </div>
    </div>
  );
}