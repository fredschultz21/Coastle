"use client";

import Link from "next/link";
import { useState } from "react";

export function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-11 md:h-11 bg-white/3 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-lg shadow-lg transition-colors flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50">
            <Link
              href="/"
              className="block px-4 py-3 text-sm text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800"
              onClick={() => setIsOpen(false)}
            >
              Daily Mode
            </Link>
            <Link
              href="/infinite"
              className="block px-4 py-3 text-sm text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800"
              onClick={() => setIsOpen(false)}
            >
              Infinite Mode
            </Link>
            <Link
              href="/how-to-play"
              className="block px-4 py-3 text-sm text-white hover:bg-zinc-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How to Play
            </Link>
          </div>
        </>
      )}
    </div>
  );
}