"use client";

import React from "react";

export default function MovingLogo() {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Fancy Cosmic Black Hole Emblem (No 'tH' text, pure astrophysics elegance) */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Deep Gravitational Lensing Glow / Ambient Warp */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-purple-600/50 via-fuchsia-600/40 to-cyan-400/50 blur-md animate-pulse pointer-events-none" />

        {/* Outer Photon Orbit Ring (Dashed, Slow Counter-Clockwise Rotation) */}
        <div className="absolute inset-0 rounded-full border border-purple-400/30 border-dashed animate-[spin_16s_linear_infinite_reverse] pointer-events-none" />

        {/* High-Velocity Orbiting Photon Particle 1 (Cyan) */}
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite] pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] -top-0.5 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* High-Velocity Orbiting Photon Particle 2 (Fuchsia) */}
        <div className="absolute inset-0 animate-[spin_6s_linear_infinite_reverse] pointer-events-none">
          <div className="w-1 h-1 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#d946ef] bottom-0 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* The Relativistic Black Hole Vector Body */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_0_16px_rgba(168,85,247,0.85)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Accretion Gradient: Cyan -> Fuchsia -> Purple -> Bright White */}
              <linearGradient id="bhAccretion" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="35%" stopColor="#c084fc" />
                <stop offset="70%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>

              {/* Lensed Light Arch Gradient */}
              <linearGradient id="bhLensing" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#e879f9" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="bhGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Lensed Gravitational Arc (Upper Warp) */}
            <path
              d="M 18 50 C 18 20, 82 20, 82 50"
              stroke="url(#bhLensing)"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-90"
              filter="url(#bhGlow)"
            />

            {/* Outer Lensed Gravitational Arc (Lower Warp) */}
            <path
              d="M 24 50 C 24 76, 76 76, 76 50"
              stroke="url(#bhLensing)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="opacity-60"
            />

            {/* Relativistic Accretion Disk (Tilted Orbiting Ring) */}
            <ellipse
              cx="50"
              cy="50"
              rx="42"
              ry="14"
              stroke="url(#bhAccretion)"
              strokeWidth="5"
              filter="url(#bhGlow)"
              className="animate-[spin_8s_linear_infinite] origin-center opacity-95"
              strokeDasharray="180 30"
            />

            {/* Inner Accretion Filament */}
            <ellipse
              cx="50"
              cy="50"
              rx="33"
              ry="10"
              stroke="#e0e7ff"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              className="animate-[spin_12s_linear_infinite_reverse] origin-center opacity-75"
            />

            {/* Razor-Sharp Photon Sphere (Boundary of No Return) */}
            <circle
              cx="50"
              cy="50"
              r="20"
              stroke="#ffffff"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_#38bdf8]"
            />
            <circle
              cx="50"
              cy="50"
              r="22"
              stroke="#c084fc"
              strokeWidth="1.5"
              className="opacity-80 drop-shadow-[0_0_12px_#c084fc]"
            />

            {/* The Singularity / Event Horizon (Absolute Pitch Black Void) */}
            <circle
              cx="50"
              cy="50"
              r="18.5"
              fill="#000000"
            />

            {/* Front Accretion Cut (Crosses in Front of Horizon for 3D Interstellar Depth) */}
            <path
              d="M 14 50 C 20 58, 80 58, 86 50"
              stroke="url(#bhAccretion)"
              strokeWidth="4.5"
              strokeLinecap="round"
              filter="url(#bhGlow)"
            />
            {/* Front Accretion Core Highlight */}
            <path
              d="M 22 51 C 32 57, 68 57, 78 51"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="opacity-90"
            />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark: tex (Moving / Circulating) + HAAB (Fixed) */}
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-0.5 leading-none">
          {/* "tex" - MOVING / CIRCULATING in Vibrant Electric Cyan-Violet */}
          <span className="inline-flex items-center font-black text-2xl tracking-tight">
            <span
              className="inline-block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.7)] animate-[circulate_3s_ease-in-out_infinite]"
              style={{ animationDelay: "0s" }}
            >
              t
            </span>
            <span
              className="inline-block bg-gradient-to-r from-sky-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-[circulate_3s_ease-in-out_infinite]"
              style={{ animationDelay: "0.18s" }}
            >
              e
            </span>
            <span
              className="inline-block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(217,70,239,0.7)] animate-[circulate_3s_ease-in-out_infinite]"
              style={{ animationDelay: "0.36s" }}
            >
              x
            </span>
          </span>

          {/* "HAAB" - FIXED / ANCHORED in Premium High-Contrast White */}
          <span className="font-black text-2xl tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ml-0.5">
            HAAB
          </span>
        </div>

        {/* Clean, Industry Standard Sub-label */}
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-300/80 mt-1">
          Knitting Recipe Intelligence
        </span>
      </div>
    </div>
  );
}
