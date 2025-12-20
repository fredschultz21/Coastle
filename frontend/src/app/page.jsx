"use client";

import { useState } from "react";

export default function Home() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/daily/zoom_1.png"
          alt="Satellite View"
          className="h-full w-full object-cover"
        />
      </div>

      {!isMinimized && (
        <div 
          className={`
            absolute bottom-6 right-6 
            transition-all duration-300 ease-in-out
            ${isHovered ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative p-4 border-[1px] border-zinc-700 bg-zinc-900 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute -top-2 -right-2 h-6 w-6 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white text-xs font-bold border border-zinc-600"
            >
              ×
            </button>
            
            <img 
              src="/pixelmap.png" 
              alt="World Map"
              style={{ imageRendering: 'pixelated' }}
              className={`
                transition-all duration-300
                ${isHovered ? 'w-80 h-48' : 'w-64 h-40'}
                object-contain rounded-lg
              `}
            />
            
            <p className="text-xs text-zinc-400 mt-2 text-center">
              © Mapbox © OpenStreetMap
            </p>
          </div>
        </div>
      )}

      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="absolute bottom-6 right-6 p-3 bg-zinc-900 hover:bg-zinc-800 border-[1px] border-zinc-700 rounded-xl shadow-lg transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>
      )}

      <button className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg shadow-lg transition-colors">
        Guess
      </button>
    </div>
  );
}