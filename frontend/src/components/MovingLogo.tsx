"use client";

import React, { useState } from "react";

interface MovingLogoProps {
  size?: "default" | "large";
}

export default function MovingLogo({ size = "default" }: MovingLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Split logo letters for individual kinetic wave animations
  const letters = [
    { char: "t", delay: "0s", color: "from-purple-300 via-violet-200 to-fuchsia-300" },
    { char: "e", delay: "0.12s", color: "from-purple-200 via-fuchsia-200 to-pink-300" },
    { char: "x", delay: "0.24s", color: "from-fuchsia-300 via-pink-200 to-indigo-300" },
    { char: "H", delay: "0.36s", color: "from-indigo-300 via-purple-200 to-violet-300" },
    { char: "A", delay: "0.48s", color: "from-purple-300 via-fuchsia-300 to-pink-200" },
    { char: "A", delay: "0.60s", color: "from-fuchsia-300 via-violet-200 to-cyan-300" },
    { char: "B", delay: "0.72s", color: "from-violet-300 via-cyan-200 to-purple-300" },
  ];

  return (
    <div
      className="flex items-center space-x-3.5 group cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glossy Cosmic Emblem with Orbiting Ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer Relativistic Glow */}
        <div
          className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 opacity-60 blur-md transition-all duration-500 group-hover:opacity-100 group-hover:blur-lg ${
            isHovered ? "scale-110" : ""
          }`}
        />

        {/* Counter-rotating Celestial Orbit Ring */}
        <div className="absolute -inset-2.5 rounded-full border border-purple-400/30 border-dashed animate-[spin_12s_linear_infinite] pointer-events-none" />
        <div className="absolute -inset-1 rounded-full border border-fuchsia-400/20 animate-[spin_8s_linear_infinite_reverse] pointer-events-none" />

        {/* Orbiting Photon Particle */}
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite] pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] -top-1 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* Emblem Medallion */}
        <div
          className={`relative ${
            size === "large" ? "w-14 h-14 text-2xl" : "w-11 h-11 text-lg"
          } rounded-xl bg-gradient-to-br from-purple-900/90 via-[#180b2b]/95 to-purple-950/90 border border-purple-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_8px_20px_rgba(147,51,234,0.4)] flex items-center justify-center text-white font-extrabold tracking-tighter backdrop-blur-xl transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Glass Specular Reflection Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl pointer-events-none" />

          {/* Lettermark */}
          <span className="bg-gradient-to-r from-purple-100 via-fuchsia-200 to-cyan-100 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(216,180,254,0.8)]">
            tH
          </span>
        </div>
      </div>

      {/* Kinetic Typography */}
      <div>
        <div className="flex items-center space-x-2">
          {/* Moving Letters */}
          <div className="flex items-center space-x-[1.5px] font-black tracking-tight">
            {letters.map((item, idx) => (
              <span
                key={idx}
                style={{
                  animationDelay: item.delay,
                  animationDuration: isHovered ? "1.2s" : "2.4s",
                }}
                className={`inline-block ${
                  size === "large" ? "text-3xl" : "text-2xl"
                } bg-gradient-to-r ${item.color} bg-clip-text text-transparent font-extrabold animate-[letterWave_2.4s_ease-in-out_infinite] transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]`}
              >
                {item.char}
              </span>
            ))}
          </div>

          {/* Glowing Space-Lab Badge */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-900/80 to-fuchsia-900/80 border border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)] tracking-wider uppercase backdrop-blur-md">
            Cosmic AI v1.0
          </span>
        </div>

        {/* Dynamic Sub-bar with Pulsar indicator */}
        <div className="flex items-center space-x-2 mt-0.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] inline-block -ml-3" />
            <p className="text-[11px] font-medium text-purple-300/80 tracking-wide">
              Circular Knitting Intelligence Space
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
