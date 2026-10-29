"use client";

import React from "react";

export default function MovingLogo() {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Sleek, Dark Astrophysical Black Hole Emblem (Clean, Non-Glossy, Authentic Deep Void) */}
      <div className="relative w-11 h-11 flex items-center justify-center">
        {/* Subtle, Muted Gravitational Warp Aura (Gentle, Not Overly Glossy) */}
        <div className="absolute inset-0 rounded-full bg-purple-950/40 border border-purple-500/20 pointer-events-none" />

        {/* Clean Outer Orbital Ring (Fine Dashed Circle) */}
        <div className="absolute inset-0 rounded-full border border-purple-400/25 border-dashed animate-[spin_25s_linear_infinite] pointer-events-none" />

        {/* Single Subtle Orbiting Photon Node */}
        <div className="absolute inset-0 animate-[spin_6s_linear_infinite] pointer-events-none">
          <div className="w-1 h-1 rounded-full bg-cyan-200/90 shadow-[0_0_4px_#38bdf8] -top-0.5 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* Vector Black Hole: Sharp, Elegant, Matte Astrophysical Geometry */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Toned Down, Sophisticated Accretion Gradient */}
              <linearGradient id="bhAccretionMatte" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
              </linearGradient>

              {/* Gravitational Lensing Arch Gradient */}
              <linearGradient id="bhLensingMatte" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 1. Lensed Gravitational Light Arc (Back Upper) */}
            <path
              d="M 22 50 C 22 26, 78 26, 78 50"
              stroke="url(#bhLensingMatte)"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="opacity-75"
            />

            {/* 2. Lensed Gravitational Light Arc (Back Lower) */}
            <path
              d="M 26 50 C 26 70, 74 70, 74 50"
              stroke="url(#bhLensingMatte)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="opacity-45"
            />

            {/* 3. Tilted Accretion Disk (Thin, Clean, Non-Glossy Orbiting Ring) */}
            <ellipse
              cx="50"
              cy="50"
              rx="40"
              ry="13"
              stroke="url(#bhAccretionMatte)"
              strokeWidth="2"
              className="animate-[spin_12s_linear_infinite] origin-center opacity-85"
              strokeDasharray="160 25"
            />

            {/* 4. Fine Stellar Dust Filament (Dotted Inner Stream) */}
            <ellipse
              cx="50"
              cy="50"
              rx="32"
              ry="9"
              stroke="#a5b4fc"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="animate-[spin_18s_linear_infinite_reverse] origin-center opacity-50"
            />

            {/* 5. Photon Sphere Rim (Delicate Thin Horizon Boundary) */}
            <circle
              cx="50"
              cy="50"
              r="20"
              stroke="#6366f1"
              strokeWidth="1.2"
              className="opacity-80"
            />

            {/* 6. The Singularity / Event Horizon (Absolute Pitch Black Void) */}
            <circle
              cx="50"
              cy="50"
              r="18.5"
              fill="#000000"
            />

            {/* 7. Front Accretion Cut (Crosses in Front for 3D Depth, Sleek & Non-Glossy) */}
            <path
              d="M 16 50 C 22 57, 78 57, 84 50"
              stroke="url(#bhAccretionMatte)"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="opacity-90"
            />
            {/* Subtle Inner Highlight Core */}
            <path
              d="M 26 51 C 34 55, 66 55, 74 51"
              stroke="#e0e7ff"
              strokeWidth="1"
              strokeLinecap="round"
              className="opacity-60"
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
