/**
 * AURA // CREATIVE STUDIO - Interactive Hero Canvas
 * Generative floating constellation & fluid physics with interactive mouse repulsion.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  let mouse = { x: -1000, y: -1000, radius: 160, isDown: false };
  let ripples = [];
  let isVisible = true;
  let animationFrameId;

  // Configuration
  const PARTICLE_COUNT_DESKTOP = 70;
  const PARTICLE_COUNT_MOBILE = 35;
  const MAX_CONNECT_DISTANCE = 140;

  class Particle {
    constructor(x, y) {
      this.x = x || Math.random() * width;
      this.y = y || Math.random() * height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1.2;
      this.colorTheme = Math.random();
      this.alpha = Math.random() * 0.5 + 0.3;
      this.glow = Math.random() * 8 + 4;
    }

    getColor() {
      if (this.colorTheme > 0.6) {
        return `rgba(0, 242, 254, ${this.alpha})`; // Cyan
      } else if (this.colorTheme > 0.25) {
        return `rgba(168, 85, 247, ${this.alpha})`; // Violet/Purple
      } else {
        return `rgba(255, 255, 255, ${this.alpha * 0.8})`; // Soft White
      }
    }

    update() {
      // Natural floating drift
      this.x += this.vx;
      this.y += this.vy;

      // Wrap boundaries
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;

      // Mouse interaction (Repulsion with spring damping)
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 5;
        this.y -= Math.sin(angle) * force * 5;
      }

      // Ripple interaction from clicks
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        const rdx = this.x - r.x;
        const rdy = this.y - r.y;
        const rDist = Math.hypot(rdx, rdy);
        const waveDist = Math.abs(rDist - r.radius);

        if (waveDist < 30) {
          const push = (1 - waveDist / 30) * r.strength * 4;
          const rAngle = Math.atan2(rdy, rdx);
          this.x += Math.cos(rAngle) * push;
          this.y += Math.sin(rAngle) * push;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.getColor();
      ctx.shadowColor = this.colorTheme > 0.6 ? '#00f2fe' : '#a855f7';
      ctx.shadowBlur = this.glow;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = width < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < MAX_CONNECT_DISTANCE) {
          const alpha = (1 - dist / MAX_CONNECT_DISTANCE) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      // Connect to mouse if near
      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const mDist = Math.hypot(mdx, mdy);
      if (mDist < mouse.radius) {
        const mAlpha = (1 - mDist / mouse.radius) * 0.35;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(0, 242, 254, ${mAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  function updateRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += 6;
      r.strength *= 0.94;
      r.alpha = r.strength * 0.4;

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 242, 254, ${r.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (r.strength < 0.02 || r.radius > 350) {
        ripples.splice(i, 1);
      }
    }
  }

  function animate() {
    if (!isVisible) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // Update and draw ripples
    updateRipples();

    // Draw connections
    drawConnections();

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Mouse Listeners
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY <= rect.bottom && e.clientY >= rect.top) {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    } else {
      mouse.x = -1000;
      mouse.y = -1000;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY <= rect.bottom && e.clientY >= rect.top) {
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 5,
        strength: 1,
        alpha: 0.5
      });
    }
  });

  // Performance Optimization: Pause when off-screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });
  observer.observe(canvas);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  // Init
  resize();
  animate();
})();
