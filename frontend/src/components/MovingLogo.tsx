"use client";

import React from "react";

export default function MovingLogo() {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Dark Purplish Glossy Emblem */}
      <div className="relative flex items-center justify-center">
        {/* Specular Ambient Glow */}
        <div className="absolute -inset-1 rounded-xl bg-purple-600/30 blur-md pointer-events-none" />

        {/* Circulating Orbit Ring around Logo Icon */}
        <div className="absolute -inset-2 rounded-full border border-purple-500/30 border-dashed animate-[spin_10s_linear_infinite] pointer-events-none" />

        {/* Circulating Photon Node */}
        <div className="absolute inset-0 animate-[spin_5s_linear_infinite] pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] -top-1 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* Glossy Obsidian-Purple Medallion */}
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#1b0633] via-[#0e021c] to-[#05000a] border border-purple-400/40 border-t-purple-300/70 shadow-[0_8px_25px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center backdrop-blur-xl">
          {/* Specular Top Reflection */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl pointer-events-none" />
          <span className="font-black text-lg text-white tracking-tight drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
            tH
          </span>
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
