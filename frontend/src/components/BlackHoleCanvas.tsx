"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  color: string;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  verticalOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function BlackHoleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
      initParticles();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Starfield
    const starColors = ["#ffffff", "#e9d5ff", "#c084fc", "#a855f7", "#38bdf8", "#f472b6"];
    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const count = Math.floor((width * height) / 5000) + 120;
      for (let i = 0; i < count; i++) {
        const baseAlpha = 0.2 + Math.random() * 0.7;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.8 + 0.4,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: 0.01 + Math.random() * 0.03,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    // Accretion Disk Particles
    let particles: Particle[] = [];
    const diskColors = [
      "#c084fc", // Purple 400
      "#a855f7", // Purple 500
      "#e879f9", // Fuchsia 400
      "#d946ef", // Fuchsia 500
      "#7c3aed", // Violet 600
      "#818cf8", // Indigo 400
      "#38bdf8", // Sky blue relativistic
      "#f43f5e", // Rose energetic
      "#ffffff", // Core photon light
    ];

    const initParticles = () => {
      particles = [];
      const particleCount = 450;
      for (let i = 0; i < particleCount; i++) {
        const radius = 60 + Math.random() * 260;
        // Keplerian-like speed: inner particles move faster
        const speed = (0.008 + 0.02 * (1 - (radius - 60) / 260)) * (Math.random() > 0.1 ? 1 : 1);
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius,
          speed,
          size: 0.8 + Math.random() * 2.2,
          color: diskColors[Math.floor(Math.random() * diskColors.length)],
          alpha: 0.2 + Math.random() * 0.8,
          verticalOffset: (Math.random() - 0.5) * 14,
        });
      }
    };

    // Shooting Stars
    let shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + 1500;

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        length: 80 + Math.random() * 140,
        speed: 12 + Math.random() * 18,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 25,
      });
      nextShootingStarTime = Date.now() + 2500 + Math.random() * 4000;
    };

    initStars();
    initParticles();

    let time = 0;

    const render = () => {
      time += 0.02;

      // Mouse damping
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Deep void base background
      const baseGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.35,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      baseGrad.addColorStop(0, "#030008");
      baseGrad.addColorStop(0.35, "#010004");
      baseGrad.addColorStop(0.7, "#000000");
      baseGrad.addColorStop(1, "#000000");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient cosmic nebula clouds
      const nebula1 = ctx.createRadialGradient(
        width * 0.75 + Math.sin(time * 0.3) * 60,
        height * 0.25 + Math.cos(time * 0.2) * 40,
        10,
        width * 0.75,
        height * 0.25,
        width * 0.45
      );
      nebula1.addColorStop(0, "rgba(168, 85, 247, 0.16)");
      nebula1.addColorStop(0.4, "rgba(139, 92, 246, 0.08)");
      nebula1.addColorStop(0.8, "rgba(99, 102, 241, 0.02)");
      nebula1.addColorStop(1, "transparent");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        width * 0.2 + Math.cos(time * 0.25) * 50,
        height * 0.65 + Math.sin(time * 0.35) * 50,
        20,
        width * 0.2,
        height * 0.65,
        width * 0.4
      );
      nebula2.addColorStop(0, "rgba(217, 70, 239, 0.12)");
      nebula2.addColorStop(0.5, "rgba(147, 51, 234, 0.06)");
      nebula2.addColorStop(1, "transparent");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Twinkling Starfield
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += Math.sin(time * 2 + i) * star.twinkleSpeed;
        const currentAlpha = Math.max(0.1, Math.min(1, star.alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = star.size > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // 2. Draw Shooting Stars
      if (Date.now() > nextShootingStarTime) {
        spawnShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life++;

        const progress = ss.life / ss.maxLife;
        const fadeAlpha = (1 - progress) * 0.85;

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.7, "rgba(192, 132, 252, 0.5)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.95)");

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = fadeAlpha;
        ctx.stroke();

        if (ss.life >= ss.maxLife) {
          shootingStars.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;

      // 3. BLACK HOLE POSITION & ACCRETION DISK
      // Anchor black hole at upper-right-center for an atmospheric hero effect
      const bhX = width * 0.72 + (mouseX - width / 2) * 0.05;
      const bhY = height * 0.28 + (mouseY - height / 2) * 0.05;
      const bhRadius = Math.min(width, height) * 0.08 + 40;

      // Gravitational lensing backdrop distortion glow
      const outerGlow = ctx.createRadialGradient(bhX, bhY, bhRadius * 0.8, bhX, bhY, bhRadius * 4.2);
      outerGlow.addColorStop(0, "rgba(168, 85, 247, 0.35)");
      outerGlow.addColorStop(0.25, "rgba(147, 51, 234, 0.2)");
      outerGlow.addColorStop(0.55, "rgba(99, 102, 241, 0.08)");
      outerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(bhX, bhY, bhRadius * 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disk tilt angle
      const diskTilt = 0.34; // vertical foreshortening

      // Back half of particles (behind singularity)
      ctx.save();
      ctx.translate(bhX, bhY);
      ctx.rotate(-0.25); // slight rotational angle

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;

        const sinA = Math.sin(p.angle);
        const cosA = Math.cos(p.angle);

        // only draw if behind (sinA < 0)
        if (sinA < 0) {
          const px = cosA * p.radius;
          const py = sinA * p.radius * diskTilt + p.verticalOffset;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.6;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      }

      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // RELATIVISTIC PHOTON RING / EINSTEIN RING
      const photonRing = ctx.createRadialGradient(
        bhX,
        bhY,
        bhRadius * 0.95,
        bhX,
        bhY,
        bhRadius * 1.3
      );
      photonRing.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      photonRing.addColorStop(0.2, "rgba(232, 121, 249, 0.85)");
      photonRing.addColorStop(0.5, "rgba(168, 85, 247, 0.5)");
      photonRing.addColorStop(0.85, "rgba(99, 102, 241, 0.2)");
      photonRing.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(bhX, bhY, bhRadius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = photonRing;
      ctx.fill();

      // THE SINGULARITY (Pure Absolute Void Black Hole)
      ctx.beginPath();
      ctx.arc(bhX, bhY, bhRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#020005";
      ctx.shadowBlur = 24;
      ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sharp event horizon outline
      ctx.beginPath();
      ctx.arc(bhX, bhY, bhRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(232, 121, 249, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Front half of particles (in front of singularity)
      ctx.save();
      ctx.translate(bhX, bhY);
      ctx.rotate(-0.25);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const sinA = Math.sin(p.angle);
        const cosA = Math.cos(p.angle);

        // draw front particles (sinA >= 0)
        if (sinA >= 0) {
          const px = cosA * p.radius;
          const py = sinA * p.radius * diskTilt + p.verticalOffset;

          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.1, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      }

      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Accretion disk bright luminous central belt
      ctx.save();
      ctx.translate(bhX, bhY);
      ctx.rotate(-0.25);
      ctx.scale(1, diskTilt);

      const beltGrad = ctx.createRadialGradient(0, 0, bhRadius * 1.05, 0, 0, bhRadius * 2.4);
      beltGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      beltGrad.addColorStop(0.3, "rgba(217, 70, 239, 0.3)");
      beltGrad.addColorStop(0.7, "rgba(147, 51, 234, 0.15)");
      beltGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(0, 0, bhRadius * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = beltGrad;
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
}
