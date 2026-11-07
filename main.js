/**
 * MAQSYMA - Industrial Cinematic Engine
 * Powered by GSAP + ScrollTrigger + Canvas Particle Sparks
 * High performance, zero frame drops, responsive scrub control
 */

(function () {
  'use strict';

  // 1. Register ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.warn('GSAP or ScrollTrigger not loaded yet.');
    return;
  }

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 2. High-Performance Particle Engine for Electric Arc Sparks
  const canvas = document.getElementById('sparksCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let sparks = [];
  let sparksIntensity = 0; // Controlled dynamically via GSAP ScrollTrigger
  let arcBrightness = 0;
  let animFrameId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Spark {
    constructor(x, y, burst = false) {
      this.reset(x, y, burst);
    }

    reset(x, y, burst) {
      this.x = x || canvas.width / 2;
      this.y = y || canvas.height * 0.52;
      
      const angle = (Math.random() * Math.PI * 2);
      const speed = burst ? (Math.random() * 14 + 4) : (Math.random() * 8 + 2);
      
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (Math.random() * 4 + 1); // upwards bias
      this.gravity = 0.28;
      this.drag = 0.96;
      this.life = 0;
      this.maxLife = Math.random() * 35 + 20;
      this.size = Math.random() * 2.8 + 1.2;
      
      // Color: white-hot center to industrial ESAB yellow or arc electric cyan
      const r = Math.random();
      if (r < 0.6) {
        this.color = '#F5C400'; // ESAB Yellow
      } else if (r < 0.85) {
        this.color = '#FFFFFF'; // White Hot
      } else {
        this.color = '#70D6FF'; // Ionized Cyan
      }
    }

    update() {
      this.vx *= this.drag;
      this.vy = (this.vy + this.gravity) * this.drag;
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
    }

    draw(context) {
      const remaining = 1 - (this.life / this.maxLife);
      if (remaining <= 0) return;

      context.save();
      context.globalAlpha = remaining;
      context.fillStyle = this.color;
      context.shadowColor = this.color;
      context.shadowBlur = 10;
      
      context.beginPath();
      context.arc(this.x, this.y, this.size * remaining, 0, Math.PI * 2);
      context.fill();

      // Spark trail line
      context.strokeStyle = this.color;
      context.lineWidth = this.size * 0.8 * remaining;
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.x - this.vx * 1.8, this.y - this.vy * 1.8);
      context.stroke();

      context.restore();
    }
  }

  function loopSparks() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn sparks based on intensity
    if (sparksIntensity > 0.05 && !prefersReducedMotion) {
      const count = Math.floor(sparksIntensity * 6);
      const originX = canvas.width * 0.5;
      const originY = canvas.height * 0.52;
      for (let i = 0; i < count; i++) {
        if (sparks.length < 220) {
          sparks.push(new Spark(originX, originY));
        }
      }
    }

    // Update & draw active sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.update();
      s.draw(ctx);
      if (s.life >= s.maxLife) {
        sparks.splice(i, 1);
      }
    }

    animFrameId = requestAnimationFrame(loopSparks);
  }

  if (!prefersReducedMotion) {
    loopSparks();
  }

  // 3. MASTER GSAP SCROLLTRIGGER 500VH SCRUBBED TIMELINE
  function initHeroScrollSequence() {
    if (prefersReducedMotion) {
      // In reduced motion, ensure elements are cleanly visible without scroll scrubbing
      gsap.set(['#slide-intro', '#slide-machine', '#slide-details', '#slide-brand'], { opacity: 1, y: 0 });
      gsap.set('.machine-hero-wrapper', { opacity: 1, scale: 1 });
      gsap.set('.machine-hotspots', { opacity: 1 });
      return;
    }

    const heroContainer = document.querySelector('.hero-scroll-container');
    const machine = document.querySelector('.machine-hero-wrapper');
    const arcLight = document.querySelector('.volumetric-arc-light');
    const welderBg = document.querySelector('.hero-welder-backdrop');
    const hotspots = document.querySelector('.machine-hotspots');
    const telemetryFill = document.querySelector('.telemetry-bar-fill');
    const telemetryStep = document.getElementById('telemetry-step');

    const slide1 = document.getElementById('slide-intro');
    const slide2 = document.getElementById('slide-machine');
    const slide3 = document.getElementById('slide-details');
    const slide4 = document.getElementById('slide-brand');

    // Initial state
    gsap.set([slide1, slide2, slide3, slide4], { opacity: 0, y: 40 });
    gsap.set(machine, { opacity: 0, scale: 0.75, rotationY: -15, filter: 'brightness(0.2) contrast(1.4)' });
    gsap.set(arcLight, { opacity: 0, scale: 0.4 });
    gsap.set(welderBg, { opacity: 0 });
    gsap.set(hotspots, { opacity: 0 });

    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8, // Smooth physical drag & catch up
        onUpdate: (self) => {
          const p = self.progress;
          if (telemetryFill) {
            telemetryFill.style.width = `${(p * 100).toFixed(1)}%`;
          }
          if (telemetryStep) {
            if (p < 0.25) telemetryStep.textContent = '01 / IGNICIÓN ARCO';
            else if (p < 0.55) telemetryStep.textContent = '02 / INVERSORA ESAB';
            else if (p < 0.82) telemetryStep.textContent = '03 / MICRO-CONTROL PFC';
            else telemetryStep.textContent = '04 / MAQSYMA EXPERT';
          }
        }
      }
    });

    // ==========================================
    // PHASE 1: [0.00 - 0.22] Arc Ignition & Sparks
    // ==========================================
    heroTimeline
      // Sparks ignite
      .to({ intensity: 0 }, {
        intensity: 1.0,
        duration: 0.15,
        onUpdate: function () {
          sparksIntensity = this.targets()[0].intensity;
        }
      }, 0)
      .to(arcLight, {
        opacity: 0.95,
        scale: 1.3,
        duration: 0.15,
        ease: 'power2.inOut'
      }, 0)
      .to(welderBg, {
        opacity: 0.55,
        duration: 0.18,
        ease: 'power2.out'
      }, 0.02)
      .to(slide1, {
        opacity: 1,
        y: 0,
        duration: 0.12,
        ease: 'power2.out'
      }, 0.04)
      .to(slide1, {
        opacity: 0,
        y: -35,
        duration: 0.08,
        ease: 'power2.in'
      }, 0.20)

      // ==========================================
      // PHASE 2: [0.22 - 0.50] Machine Revelation
      // ==========================================
      .to(machine, {
        opacity: 1,
        scale: 1.0,
        rotationY: 0,
        filter: 'brightness(1.05) contrast(1.08)',
        duration: 0.25,
        ease: 'power3.out'
      }, 0.22)
      .to(arcLight, {
        opacity: 0.45,
        scale: 1.0,
        duration: 0.2,
        ease: 'power2.out'
      }, 0.22)
      .to({ intensity: 1.0 }, {
        intensity: 0.35,
        duration: 0.2,
        onUpdate: function () {
          sparksIntensity = this.targets()[0].intensity;
        }
      }, 0.22)
      .to(slide2, {
        opacity: 1,
        y: 0,
        duration: 0.14,
        ease: 'power2.out'
      }, 0.26)
      .to(slide2, {
        opacity: 0,
        y: -35,
        duration: 0.08,
        ease: 'power2.in'
      }, 0.48)

      // ==========================================
      // PHASE 3: [0.50 - 0.76] Technical Zoom & Hotspots
      // ==========================================
      .to(machine, {
        scale: 1.35,
        x: '-8%',
        y: '5%',
        duration: 0.24,
        ease: 'power2.inOut'
      }, 0.50)
      .to(hotspots, {
        opacity: 1,
        duration: 0.12,
        ease: 'power2.out'
      }, 0.52)
      .to(slide3, {
        opacity: 1,
        y: 0,
        duration: 0.14,
        ease: 'power2.out'
      }, 0.53)
      .to(hotspots, {
        opacity: 0,
        duration: 0.08,
        ease: 'power2.in'
      }, 0.72)
      .to(slide3, {
        opacity: 0,
        y: -35,
        duration: 0.08,
        ease: 'power2.in'
      }, 0.74)

      // ==========================================
      // PHASE 4: [0.76 - 1.00] MAQSYMA Authority & Catalog Handoff
      // ==========================================
      .to(machine, {
        scale: 0.95,
        x: '0%',
        y: '0%',
        opacity: 0.85,
        duration: 0.20,
        ease: 'power2.out'
      }, 0.76)
      .to(welderBg, {
        opacity: 0.15,
        duration: 0.18
      }, 0.76)
      .to({ intensity: 0.35 }, {
        intensity: 0.0,
        duration: 0.20,
        onUpdate: function () {
          sparksIntensity = this.targets()[0].intensity;
        }
      }, 0.76)
      .to(slide4, {
        opacity: 1,
        y: 0,
        duration: 0.16,
        ease: 'power2.out'
      }, 0.80);
  }

  // 4. Product Tab Filtering Logic
  function initProductTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.product-card');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              display: 'flex',
              duration: 0.3,
              ease: 'power2.out'
            });
          } else {
            gsap.to(card, {
              opacity: 0,
              scale: 0.95,
              duration: 0.2,
              ease: 'power2.in',
              onComplete: () => {
                card.style.display = 'none';
              }
            });
          }
        });
      });
    });
  }

  // 5. Dynamic WhatsApp Quote Configurator
  function initWhatsAppConfigurator() {
    const selectModel = document.getElementById('quote-model');
    const inputUsage = document.getElementById('quote-usage');
    const inputCity = document.getElementById('quote-city');
    const btnQuote = document.getElementById('btn-whatsapp-submit');

    // Also support quick quotes from product cards
    const cardQuoteBtns = document.querySelectorAll('.btn-card-quote');
    cardQuoteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modelName = btn.getAttribute('data-model');
        if (selectModel) {
          selectModel.value = modelName;
          const consultancySection = document.getElementById('cotizaciones');
          if (consultancySection) {
            consultancySection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    if (btnQuote) {
      btnQuote.addEventListener('click', (e) => {
        e.preventDefault();
        const model = selectModel ? selectModel.value : 'Equipo ESAB Inversor';
        const usage = inputUsage && inputUsage.value.trim() ? inputUsage.value.trim() : 'Trabajo Industrial / Taller';
        const city = inputCity && inputCity.value.trim() ? inputCity.value.trim() : 'México';

        const message = `¡Hola MAQSYMA! Requiero cotización formal y asesoría técnica para la máquina inversora:\n\n*Modelo:* ${model}\n*Aplicación/Uso:* ${usage}\n*Ubicación:* ${city}\n\n¿Tienen disponibilidad para entrega y soporte de garantía?`;

        // Direct WhatsApp API
        const phone = '525540001234'; // Dedicated corporate line placeholder
        const encodedUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(encodedUrl, '_blank', 'noopener,noreferrer');
      });
    }
  }

  // 6. Smooth Scroll Anchor Handler
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // 7. Navbar Scroll State
  function initNavbarBehavior() {
    const nav = document.querySelector('.nav-container');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        nav.style.background = 'rgba(6, 7, 9, 0.92)';
        nav.style.borderColor = 'rgba(245, 196, 0, 0.35)';
      } else {
        nav.style.background = 'rgba(11, 13, 17, 0.78)';
        nav.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }
    }, { passive: true });
  }

  // Initialize all modules on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initHeroScrollSequence();
    initProductTabs();
    initWhatsAppConfigurator();
    initAnchorLinks();
    initNavbarBehavior();
  });

})();
