/**
 * MAQSYMA - Industrial Cinematic Engine & E-Commerce Core
 * WhatsApp Integration: +51 957 082 739
 * Currency Support: USD ($) & PEN (S/.)
 * Dynamic Inventory Management & LocalStorage Persistence
 */

(function () {
  'use strict';

  // Master Configuration
  const CONFIG = {
    whatsappNumber: '51957082739',
    storageKeyProducts: 'maqsyma_inventory_v1',
    storageKeyCart: 'maqsyma_cart_v1',
    storageKeyCurrency: 'maqsyma_currency_v1'
  };

  // State Management
  let products = [];
  let cart = [];
  let currentCurrency = localStorage.getItem(CONFIG.storageKeyCurrency) || 'USD';
  let activeFilter = 'all';
  let searchQuery = '';

  // 1. GSAP ScrollTrigger Registration
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // =========================================================================
  // 1. Módulo de Detección de Capacidad de Dispositivo (Tiers: alto, medio, bajo)
  // =========================================================================
  let deviceTier = 'alto'; // 'alto' | 'medio' | 'bajo'
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  function evaluateDeviceCapability() {
    let score = 100;

    // A. Ancho y pointer
    const isTouchOnly = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches;
    if (isTouchOnly || isMobileDevice) score -= 35;
    if (window.innerWidth < 768) score -= 15;

    // B. Concurrencia de hardware (núcleos de CPU)
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) score -= 35;
    else if (cores <= 4) score -= 15;

    // C. Memoria de dispositivo (RAM en GB)
    const memory = navigator.deviceMemory || 4;
    if (memory <= 2) score -= 40;
    else if (memory <= 4) score -= 20;

    // D. Reduced motion fuerza inmediatamente nivel bajo
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      score = 0;
    }

    if (score >= 70) deviceTier = 'alto';
    else if (score >= 40) deviceTier = 'medio';
    else deviceTier = 'bajo';

    applyDeviceTier(deviceTier);
    sampleFPSAndCalibrate();
  }

  function applyDeviceTier(tier) {
    deviceTier = tier;
    document.documentElement.setAttribute('data-device-tier', tier);
    document.documentElement.classList.remove('tier-alto', 'tier-medio', 'tier-bajo');
    document.documentElement.classList.add(`tier-${tier}`);
  }

  // Muestreo dinámico de FPS en 1.5s para recalibrar a tier medio o bajo si hay frame drops
  function sampleFPSAndCalibrate() {
    if (deviceTier === 'bajo') return;
    let frames = 0;
    const startTime = performance.now();

    function checkFrame(now) {
      frames++;
      const elapsed = now - startTime;
      if (elapsed < 1400) {
        requestAnimationFrame(checkFrame);
      } else {
        const fps = Math.round((frames * 1000) / elapsed);
        if (fps < 32 && deviceTier !== 'bajo') {
          console.warn(`[MAQSYMA Perf] FPS observado: ${fps}. Degradando dinámicamente atmósfera a nivel bajo.`);
          applyDeviceTier('bajo');
          if (canvas) canvas.style.display = 'none';
        } else if (fps < 48 && deviceTier === 'alto') {
          console.info(`[MAQSYMA Perf] FPS observado: ${fps}. Ajustando atmósfera a nivel medio.`);
          applyDeviceTier('medio');
        }
      }
    }
    requestAnimationFrame(checkFrame);
  }

  evaluateDeviceCapability();

  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Escuchar cambios dinámicos en prefers-reduced-motion
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
    if (prefersReducedMotion) {
      applyDeviceTier('bajo');
      if (heroTimeline) heroTimeline.pause(0);
      if (sparksRafId) {
        cancelAnimationFrame(sparksRafId);
        sparksRafId = null;
      }
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      evaluateDeviceCapability();
      if (!sparksRafId && deviceTier !== 'bajo') loopSparks();
    }
  });

  // =========================================================================
  // 3. Cinematic Video Scrollytelling Engine (5 Escenas - MAQSYMA + ESAB)
  // =========================================================================
  const scenePanels = [
    document.getElementById('scenePanel1'),
    document.getElementById('scenePanel2'),
    document.getElementById('scenePanel3'),
    document.getElementById('scenePanel4'),
    document.getElementById('scenePanel5')
  ];

  const videos = [
    document.getElementById('cineVideo1'),
    document.getElementById('cineVideo2'),
    document.getElementById('cineVideo3'),
    document.getElementById('cineVideo4'),
    document.getElementById('cineVideo5')
  ];

  const posters = [
    document.getElementById('poster1'),
    document.getElementById('poster2'),
    document.getElementById('poster3'),
    document.getElementById('poster4'),
    document.getElementById('poster5')
  ];

  const slides = [
    document.getElementById('slide-01'),
    document.getElementById('slide-02'),
    document.getElementById('slide-03'),
    document.getElementById('slide-04'),
    document.getElementById('slide-05')
  ];

  const hudProgressFill = document.getElementById('hudProgressFill');
  const hudActiveLabel = document.getElementById('hudActiveLabel');
  const lightBeam = document.getElementById('cinematicLightBeam');
  const electricFlash = document.getElementById('cinematicElectricFlash');
  const fadeBlack = document.getElementById('cinematicFadeBlack');
  const scrollInvitation = document.getElementById('sceneScrollInvitation');

  const sceneLabels = [
    '01 // THE INDUSTRIAL AWAKENING',
    '02 // ESTACIÓN: LOS MÁS VENDIDOS',
    '03 // ESTACIÓN: NUEVOS MODELOS',
    '04 // ESTACIÓN: LOS MÁS VALORADOS',
    '05 // SHOWROOM MAQSYMA // CATÁLOGO'
  ];

  // Configuración de buffering, fast seeking y lazy-loading progresivo
  const videoLoadedState = [false, false, false, false, false];

  function setupVideo(idx) {
    const v = videos[idx];
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');

    if (idx === 0) {
      v.loop = true;
      v.setAttribute('loop', '');
      v.autoplay = true;
      v.setAttribute('autoplay', '');
    }

    v.addEventListener('canplay', () => {
      videoLoadedState[idx] = true;
      if (posters[idx]) {
        posters[idx].style.opacity = '0';
      }
      if (idx === 0) {
        // Reproducir automáticamente en bucle continuo al cargar la página
        const playPromise = v.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay bloqueado por políticas del navegador: reintentar al primer gesto
            const onFirstTouch = () => {
              v.play();
              window.removeEventListener('click', onFirstTouch);
              window.removeEventListener('touchstart', onFirstTouch);
              window.removeEventListener('scroll', onFirstTouch);
            };
            window.addEventListener('click', onFirstTouch, { once: true });
            window.addEventListener('touchstart', onFirstTouch, { once: true });
            window.addEventListener('scroll', onFirstTouch, { once: true });
          });
        }
      }
    }, { once: true });

    // Si el video entra en waiting/seeking largo, reasegurar que el poster o el fotograma eviten pantalla negra
    v.addEventListener('seeking', () => {
      if (posters[idx] && posters[idx].style.opacity !== '0') {
        posters[idx].style.opacity = '0.5';
      }
    });

    v.addEventListener('error', () => {
      console.warn(`[Cinematic] Fallback poster permanente para video escena ${idx + 1}`);
      if (posters[idx]) {
        posters[idx].style.opacity = '1';
        posters[idx].style.visibility = 'visible';
      }
    });
  }

  // Cargar videos 1 y 2 inmediatamente para fluidez instantánea y reversibilidad
  setupVideo(0);
  setupVideo(1);
  if (videos[0]) videos[0].load();
  if (videos[1]) videos[1].load();

  // Pre-cargar video bajo demanda cuando el usuario se acerca a su escena
  function preloadNextVideo(idx) {
    if (idx >= 0 && idx < videos.length) {
      const v = videos[idx];
      if (v && v.preload !== 'auto') {
        v.preload = 'auto';
        setupVideo(idx);
        v.load();
      }
    }
  }

  // Estrategia de scrub optimizada con rAF y bloqueo de seeking concurrente
  const videoSeekTargets = [0, 0, 0, 0, 0];
  const videoSeeking = [false, false, false, false, false];

  function requestVideoScrub(videoIndex, progressRatio) {
    const v = videos[videoIndex];
    if (!v || !v.duration || isNaN(v.duration)) return;

    const target = Math.max(0, Math.min(v.duration - 0.05, progressRatio * v.duration));
    videoSeekTargets[videoIndex] = target;

    if (!videoSeeking[videoIndex]) {
      applyPendingSeek(videoIndex);
    }
  }

  function applyPendingSeek(index) {
    const v = videos[index];
    if (!v || isNaN(v.duration)) return;

    const target = videoSeekTargets[index];
    if (Math.abs(v.currentTime - target) < 0.035) return;

    videoSeeking[index] = true;

    // Si el navegador soporta fastSeek (ej. Safari / Firefox / WebKit)
    if (typeof v.fastSeek === 'function') {
      try {
        v.fastSeek(target);
      } catch (e) {
        v.currentTime = target;
      }
    } else {
      v.currentTime = target;
    }

    const onSeeked = () => {
      v.removeEventListener('seeked', onSeeked);
      videoSeeking[index] = false;
      // Si el objetivo varió mientras se buscaba, aplicar el último objetivo acumulado
      if (Math.abs(v.currentTime - videoSeekTargets[index]) > 0.04) {
        requestAnimationFrame(() => applyPendingSeek(index));
      }
    };
    v.addEventListener('seeked', onSeeked, { once: true });
  }

  // Función para navegar suavemente a una escena/estación
  function scrollToStation(sceneNumber) {
    const heroContainer = document.querySelector('.hero-scroll-container');
    if (!heroContainer) return;
    const startY = heroContainer.offsetTop;
    const totalH = heroContainer.offsetHeight - window.innerHeight;
    const targetRatio = (sceneNumber - 1) / 4;
    window.scrollTo({
      top: startY + (totalH * targetRatio),
      behavior: 'smooth'
    });
  }

  // 3. Orquestador Maestro GSAP ScrollTrigger para los 5 videos con estaciones interactivas (Plateau dwell)
  let heroTimeline = null;
  function initHeroScrollSequence() {
    if (prefersReducedMotion) {
      if (scenePanels[0]) {
        scenePanels[0].style.opacity = '1';
        scenePanels[0].style.visibility = 'visible';
      }
      if (slides[0]) {
        slides[0].style.opacity = '1';
        slides[0].style.transform = 'none';
        slides[0].classList.add('active-events');
      }
      return;
    }

    const heroContainer = document.querySelector('.hero-scroll-container');
    if (!heroContainer) return;

    if (heroTimeline) {
      heroTimeline.kill();
    }

    // Configuración inicial de todas las capas
    scenePanels.forEach((panel) => {
      if (panel) gsap.set(panel, { opacity: 0, visibility: 'visible', scale: 1.0 });
    });
    slides.forEach((slide) => {
      if (slide) {
        gsap.set(slide, { opacity: 0, y: 35, visibility: 'visible' });
        slide.classList.remove('active-events');
      }
    });
    if (lightBeam) gsap.set(lightBeam, { opacity: 0, x: '-60%' });
    if (electricFlash) gsap.set(electricFlash, { opacity: 0 });
    if (fadeBlack) gsap.set(fadeBlack, { opacity: 0 });

    // Panel 1 visible al inicio (video limpio)
    if (scenePanels[0]) gsap.set(scenePanels[0], { opacity: 1, visibility: 'visible' });

    const isMobileTier = isMobileDevice || deviceTier === 'bajo';
    const scrubIntensity = isMobileTier ? 0.35 : 0.65;

    // Timeline Maestro Scrollytelling
    heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: scrubIntensity,
        onUpdate: (self) => {
          const p = self.progress;

          // Progreso general HUD
          if (hudProgressFill) {
            hudProgressFill.style.width = `${(p * 100).toFixed(1)}%`;
          }

          // Detección de escena actual y precarga bidireccional
          let currentScene = Math.min(4, Math.floor(p / 0.20));
          if (p >= 0.96) currentScene = 4;

          if (hudActiveLabel && sceneLabels[currentScene]) {
            hudActiveLabel.textContent = sceneLabels[currentScene];
          }

          // Actualizar Minimapa de Dots Laterales
          const navDots = document.querySelectorAll('.nav-dot');
          navDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentScene);
          });

          // Ocultar suavemente el prompt de invitación a explorar cuando se inicia el scroll
          if (scrollInvitation) {
            scrollInvitation.classList.toggle('hidden', p > 0.04);
          }

          // Precarga bidireccional anticipada (adelante y atrás)
          if (currentScene < 4) preloadNextVideo(currentScene + 1);
          if (currentScene > 0) preloadNextVideo(currentScene - 1);

          // Sincronización Scrub Frame-by-Frame para los videos de las estaciones comerciales
          // (Nota: El video 0 se reproduce automáticamente en vivo al abrir la página)
          // Escena 2: [0.20 -> 0.40] (Pausa extendida de 0.24 a 0.36)
          if (p >= 0.17 && p < 0.43) {
            let ratio = 0;
            if (p < 0.24) {
              ratio = (p - 0.20) / 0.04 * 0.70;
            } else if (p >= 0.24 && p <= 0.36) {
              ratio = 0.70; // Pausa fotograma estético extendida
            } else {
              ratio = 0.70 + ((p - 0.36) / 0.04 * 0.30);
            }
            requestVideoScrub(1, Math.max(0, Math.min(1, ratio)));
          }
          // Escena 3: [0.40 -> 0.60] (Pausa extendida de 0.44 a 0.56)
          if (p >= 0.37 && p < 0.63) {
            let ratio = 0;
            if (p < 0.44) {
              ratio = (p - 0.40) / 0.04 * 0.65;
            } else if (p >= 0.44 && p <= 0.56) {
              ratio = 0.65; // Pausa fotograma estético extendida
            } else {
              ratio = 0.65 + ((p - 0.56) / 0.04 * 0.35);
            }
            requestVideoScrub(2, Math.max(0, Math.min(1, ratio)));
          }
          // Escena 4: [0.60 -> 0.80] (Pausa extendida de 0.64 a 0.76)
          if (p >= 0.57 && p < 0.83) {
            let ratio = 0;
            if (p < 0.64) {
              ratio = (p - 0.60) / 0.04 * 0.68;
            } else if (p >= 0.64 && p <= 0.76) {
              ratio = 0.68; // Pausa fotograma estético extendida
            } else {
              ratio = 0.68 + ((p - 0.76) / 0.04 * 0.32);
            }
            requestVideoScrub(3, Math.max(0, Math.min(1, ratio)));
          }
          // Escena 5: [0.80 -> 1.00] (Avance cinematográfico final hacia el catálogo)
          if (p >= 0.77) {
            const ratio = Math.max(0, Math.min(1, (p - 0.80) / 0.20));
            requestVideoScrub(4, ratio);
          }
        }
      }
    });

    // =========================================================================
    // NARRATIVA, ESTACIONES COMERCIALES Y TRANSICIONES CINEMATOGRÁFICAS
    // =========================================================================

    // --- ESCENA 01 (0.00 a 0.20): The Industrial Awakening (Video Limpio al Abrir) ---
    heroTimeline
      .to(scenePanels[0], { scale: 1.05, duration: 0.17, ease: 'none' }, 0)
      
      // Transición 01 -> 02: LIGHT BEAM REVEAL (Auto-reversa segura)
      .to(lightBeam, { opacity: 1, x: '40%', duration: 0.035, ease: 'power2.inOut' }, 0.16)
      .to(scenePanels[0], { opacity: 0, duration: 0.04 }, 0.18)
      .to(scenePanels[1], { opacity: 1, scale: 1.02, duration: 0.04 }, 0.18)
      .to(lightBeam, { opacity: 0, x: '100%', duration: 0.03 }, 0.20)

      // --- ESCENA 02 (0.20 a 0.40): ESTACIÓN COMERCIAL «LOS MÁS VENDIDOS» ---
      .to(slides[1], { 
        opacity: 1, 
        y: 0, 
        duration: 0.04, 
        ease: 'power2.out',
        onStart: () => { slides[1].classList.add('active-events'); },
        onReverseComplete: () => { slides[1].classList.remove('active-events'); }
      }, 0.21)
      .to(scenePanels[1], { scale: 1.06, duration: 0.15, ease: 'none' }, 0.21)
      // Pausa extendida durante [0.24 a 0.36]
      // Salida hacia la transición 03
      .to(slides[1], { 
        opacity: 0, 
        y: -30, 
        duration: 0.035, 
        ease: 'power2.in',
        onComplete: () => { slides[1].classList.remove('active-events'); },
        onReverseComplete: () => { slides[1].classList.add('active-events'); }
      }, 0.36)

      // Transición 02 -> 03: ELECTRIC FLASH
      .to(electricFlash, { opacity: 0.95, duration: 0.03, ease: 'power3.in' }, 0.37)
      .to(scenePanels[1], { opacity: 0, duration: 0.04 }, 0.38)
      .to(scenePanels[2], { opacity: 1, scale: 1.03, duration: 0.04 }, 0.38)
      .to(electricFlash, { opacity: 0, duration: 0.04, ease: 'power2.out' }, 0.40)

      // --- ESCENA 03 (0.40 a 0.60): ESTACIÓN COMERCIAL «NUEVOS MODELOS» ---
      .to(slides[2], { 
        opacity: 1, 
        y: 0, 
        duration: 0.04, 
        ease: 'power2.out',
        onStart: () => { slides[2].classList.add('active-events'); },
        onReverseComplete: () => { slides[2].classList.remove('active-events'); }
      }, 0.41)
      .to(scenePanels[2], { scale: 1.08, duration: 0.15, ease: 'none' }, 0.41)
      // Pausa extendida durante [0.44 a 0.56]
      // Salida
      .to(slides[2], { 
        opacity: 0, 
        y: -30, 
        duration: 0.035, 
        ease: 'power2.in',
        onComplete: () => { slides[2].classList.remove('active-events'); },
        onReverseComplete: () => { slides[2].classList.add('active-events'); }
      }, 0.56)

      // Transición 03 -> 04: PARTICLE CROSSFADE
      .to(scenePanels[2], { opacity: 0, scale: 1.12, duration: 0.04 }, 0.57)
      .to(scenePanels[3], { opacity: 1, scale: 1.02, duration: 0.04 }, 0.58)

      // --- ESCENA 04 (0.60 a 0.80): ESTACIÓN COMERCIAL «LOS EQUIPOS MÁS VALORADOS» ---
      .to(slides[3], { 
        opacity: 1, 
        y: 0, 
        duration: 0.04, 
        ease: 'power2.out',
        onStart: () => { slides[3].classList.add('active-events'); },
        onReverseComplete: () => { slides[3].classList.remove('active-events'); }
      }, 0.61)
      .to(scenePanels[3], { scale: 1.06, duration: 0.15, ease: 'none' }, 0.61)
      // Pausa extendida durante [0.64 a 0.76]
      // Salida
      .to(slides[3], { 
        opacity: 0, 
        y: -30, 
        duration: 0.035, 
        ease: 'power2.in',
        onComplete: () => { slides[3].classList.remove('active-events'); },
        onReverseComplete: () => { slides[3].classList.add('active-events'); }
      }, 0.76)

      // Transición 04 -> 05: MATCH CUT
      .to(scenePanels[3], { opacity: 0, duration: 0.04 }, 0.77)
      .to(scenePanels[4], { opacity: 1, scale: 1.01, duration: 0.04 }, 0.78)

      // --- ESCENA 05 (0.80 a 1.00): Built for Industry & Cierre Showroom ---
      .to(slides[4], { 
        opacity: 1, 
        y: 0, 
        duration: 0.05, 
        ease: 'power2.out',
        onStart: () => { slides[4].classList.add('active-events'); },
        onReverseComplete: () => { slides[4].classList.remove('active-events'); }
      }, 0.81)
      .to(scenePanels[4], { scale: 1.05, duration: 0.14, ease: 'none' }, 0.81)
      .to(fadeBlack, { opacity: 0.7, duration: 0.06 }, 0.94);
  }

  // 4. Products & Inventory Engine
  async function loadProducts() {
    try {
      const resp = await fetch('/api/products');
      if (resp.ok) {
        products = await resp.json();
      } else {
        throw new Error('API response not ok');
      }
    } catch (apiErr) {
      console.warn('Cargando catálogo desde data/products.json local:', apiErr.message);
      try {
        const localResp = await fetch('data/products.json');
        products = await localResp.json();
      } catch (err) {
        console.error('Error al cargar productos fallback:', err);
      }
    }
    renderCatalog();
    renderCommercialStations();
    populateQuoteSelect();
  }

  function saveProducts() {
    // Modo offline/cache local opcional
    try {
      localStorage.setItem(CONFIG.storageKeyProducts, JSON.stringify(products));
    } catch (e) {}
  }

  function formatPrice(usd, pen) {
    if (currentCurrency === 'PEN') {
      return `S/. ${pen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    }
    return `$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
  }

  function renderCommercialStations() {
    if (!products || products.length === 0) return;

    // Clasificación de productos según Opción A
    const bestSellerIds = ['rebel-emp-215ic', 'rogue-es-245i', 'rogue-em-210'];
    const newArrivalIds = ['rustler-em-215', 'rustler-em-300', 'rogue-et-201ip-pro'];
    const topRatedIds = ['warrior-500', 'rogue-es-305i'];

    const bestSellers = bestSellerIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    const newArrivals = newArrivalIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    const topRated = topRatedIds.map(id => products.find(p => p.id === id)).filter(Boolean);

    // Tooltips técnicos enriquecidos para tarjetas comerciales
    const productTooltips = {
      'rebel-emp-215ic': 'Tecnología sMIG exclusiva: aprendizaje y adaptación continua del arco de soldadura.',
      'rogue-es-245i': 'Módulo PFC avanzado: estabilidad óptima incluso con extensiones de cable de hasta 100 metros.',
      'rogue-em-210': 'Alimentador industrial de 2 rodillos con regulación digital milimétrica de inductancia.',
      'rustler-em-215': 'Última generación Inverter con pantalla digital intuitiva y chasis ultra compacto.',
      'rustler-em-300': 'Potencia pesada compacta con sinergia inteligente para producción industrial ágil.',
      'rogue-et-201ip-pro': 'Arco TIG HF de alta frecuencia con modo pulsado de precisión hasta 500 Hz.',
      'warrior-500': 'Ciclo de trabajo al 100% en condiciones extremas de fabricación pesada y minería.',
      'rogue-es-305i': 'Potencia de 300A para electrodos celulósicos pesados con excelente penetración.'
    };

    function createStationCardHTML(p, commercialTag, metricLabel) {
      const inStock = p.stock > 0;
      const stockBadge = inStock
        ? `<span class="station-card-stock"><svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg> ${p.stock} disp.</span>`
        : `<span class="station-card-stock" style="color: #ef4444;">Bajo pedido</span>`;

      const advantageTip = productTooltips[p.id] || p.subtitle;

      return `
        <article class="station-product-card" data-id="${p.id}">
          <div class="station-card-top">
            <span class="station-card-tag has-tech-tip" title="${advantageTip}">
              ${commercialTag}
              <span class="tech-tip-popup">${advantageTip}</span>
            </span>
            ${stockBadge}
          </div>
          <div class="station-card-image-wrap" onclick="window.MAQSYMA.openSpecModal('${p.id}')">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
          </div>
          <div class="station-card-brand-row">
            <span class="station-card-brand">ESAB // ORIGINAL</span>
            <span class="station-card-metric">${metricLabel}</span>
          </div>
          <h3 class="station-card-name" onclick="window.MAQSYMA.openSpecModal('${p.id}')" title="${p.name}">${p.name}</h3>
          <p class="station-card-desc">${p.subtitle}</p>
          <div class="station-card-price-row">
            <span class="station-card-price">${formatPrice(p.priceUSD, p.pricePEN)}</span>
            <span class="station-card-price-tax">${currentCurrency === 'PEN' ? 'IGV Inc.' : '+ IVA'}</span>
          </div>
          <div class="station-card-actions">
            <button class="btn-station-view" onclick="window.MAQSYMA.openSpecModal('${p.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Ver Equipo
            </button>
            <button class="btn-station-add" ${!inStock ? 'disabled' : ''} onclick="window.MAQSYMA.addToCart('${p.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
              ${inStock ? 'Añadir' : 'Sin Stock'}
            </button>
          </div>
        </article>
      `;
    }

    const gridBestSellers = document.getElementById('station-grid-bestsellers');
    if (gridBestSellers) {
      gridBestSellers.innerHTML = bestSellers.map(p => 
        createStationCardHTML(p, 'TOP VENTAS', p.specs?.ciclo || 'Alta Demanda')
      ).join('');
    }

    const gridNewArrivals = document.getElementById('station-grid-newarrivals');
    if (gridNewArrivals) {
      gridNewArrivals.innerHTML = newArrivals.map(p => 
        createStationCardHTML(p, 'NUEVO MODELO', p.categoryLabel || 'Nueva Generación')
      ).join('');
    }

    const gridTopRated = document.getElementById('station-grid-toprated');
    if (gridTopRated) {
      gridTopRated.innerHTML = topRated.map(p => 
        createStationCardHTML(p, 'MÁXIMO RENDIMIENTO', p.specs?.amperaje || 'Uso Continuo')
      ).join('');
    }
  }

  function renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const filtered = products.filter(p => {
      const matchesCategory = (activeFilter === 'all' || p.category === activeFilter);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q) || (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--color-metal-400);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p style="font-size: 16px; font-weight: 600;">No se encontraron equipos que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const inStock = p.stock > 0;
      const stockBadge = inStock
        ? `<span class="badge-stock in-stock"><svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg> En Stock (${p.stock})</span>`
        : `<span class="badge-stock out-of-stock">Agotado / Bajo Pedido</span>`;

      return `
        <article class="product-card" data-id="${p.id}" data-category="${p.category}">
          <div class="card-top-badges">
            <span class="badge-category">${p.categoryLabel || p.category}</span>
            ${stockBadge}
          </div>
          <div class="product-image-container" onclick="window.MAQSYMA.openSpecModal('${p.id}')">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
          </div>
          <div class="product-details">
            <h3 class="product-title" onclick="window.MAQSYMA.openSpecModal('${p.id}')">${p.name}</h3>
            <p class="product-process-tag">${p.subtitle}</p>
            
            <div class="product-price-row">
              <span class="price-tag">${formatPrice(p.priceUSD, p.pricePEN)}</span>
              <span class="price-currency">${currentCurrency === 'PEN' ? 'PEN (IGV Inc.)' : '+ IVA'}</span>
            </div>

            <div class="specs-list">
              <div class="spec-item">
                <span class="spec-name">Rango Amperaje</span>
                <span class="spec-val">${p.specs?.amperaje || 'N/A'}</span>
              </div>
              <div class="spec-item">
                <span class="spec-name">Ciclo de Trabajo</span>
                <span class="spec-val">${p.specs?.ciclo || 'N/A'}</span>
              </div>
              <div class="spec-item">
                <span class="spec-name">Voltaje Entrada</span>
                <span class="spec-val">${p.specs?.voltaje || 'N/A'}</span>
              </div>
              <div class="spec-item">
                <span class="spec-name">Peso Chasis</span>
                <span class="spec-val">${p.specs?.peso || 'N/A'}</span>
              </div>
            </div>

            <div class="product-footer-actions">
              <button class="btn-card-add" ${!inStock ? 'disabled' : ''} onclick="window.MAQSYMA.addToCart('${p.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                ${inStock ? 'Añadir al Carrito' : 'Sin Stock'}
              </button>
              <button class="btn-card-spec" onclick="window.MAQSYMA.openSpecModal('${p.id}')" title="Ver ficha técnica completa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // 5. Shopping Cart System (Drawer + WhatsApp Dispatch)
  function loadCart() {
    const saved = localStorage.getItem(CONFIG.storageKeyCart);
    if (saved) {
      try { cart = JSON.parse(saved); } catch (e) { cart = []; }
    }
    updateCartUI();
  }

  function saveCart() {
    localStorage.setItem(CONFIG.storageKeyCart, JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
      if (existing.qty < product.stock) {
        existing.qty++;
        showToast(`Agregado: ${product.name} (x${existing.qty})`);
      } else {
        showToast(`Stock máximo alcanzado para este equipo (${product.stock} disp.)`);
      }
    } else {
      cart.push({ id: productId, qty: 1 });
      showToast(`Equipo añadido al carrito`);
    }
    saveCart();
    openCartDrawer();
  }

  function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    const product = products.find(p => p.id === productId);
    if (!item || !product) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== productId);
    } else if (item.qty > product.stock) {
      item.qty = product.stock;
      showToast(`Stock máximo alcanzado (${product.stock} unidades)`);
    }
    saveCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    showToast('Equipo eliminado del pedido');
  }

  function updateCartUI() {
    const badge = document.getElementById('cart-count-badge');
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if (badge) badge.textContent = totalCount;

    const body = document.getElementById('cart-items-body');
    const totalElem = document.getElementById('cart-total-amount');

    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty-message">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <p>Tu carrito de cotización está vacío.</p>
          <button class="btn-primary-esab" onclick="window.MAQSYMA.closeCartDrawer(); window.location.href='#catalogo';" style="padding: 10px 20px; font-size: 12px;">Explorar Catálogo</button>
        </div>
      `;
      if (totalElem) totalElem.textContent = currentCurrency === 'PEN' ? 'S/. 0.00' : '$ 0.00 USD';
      return;
    }

    let totalSumUSD = 0;
    let totalSumPEN = 0;

    body.innerHTML = cart.map(item => {
      const p = products.find(prod => prod.id === item.id);
      if (!p) return '';

      totalSumUSD += (p.priceUSD * item.qty);
      totalSumPEN += (p.pricePEN * item.qty);

      const itemPrice = currentCurrency === 'PEN'
        ? `S/. ${(p.pricePEN * item.qty).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
        : `$ ${(p.priceUSD * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;

      return `
        <div class="cart-item-row">
          <div class="cart-item-thumb">
            <img src="${p.image}" alt="${p.name}">
          </div>
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <div class="cart-item-price">${itemPrice}</div>
            <div class="cart-item-controls">
              <button class="btn-qty" onclick="window.MAQSYMA.updateQty('${p.id}', -1)">-</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="btn-qty" onclick="window.MAQSYMA.updateQty('${p.id}', 1)">+</button>
            </div>
          </div>
          <button class="btn-item-remove" onclick="window.MAQSYMA.removeFromCart('${p.id}')" title="Quitar equipo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
    }).join('');

    if (totalElem) {
      totalElem.textContent = currentCurrency === 'PEN'
        ? `S/. ${totalSumPEN.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
        : `$ ${totalSumUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
    }

    // Validación segura en servidor
    fetch('/api/cart/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, currency: currentCurrency })
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.summary && totalElem) {
          totalElem.textContent = currentCurrency === 'PEN'
            ? `S/. ${data.summary.totalPEN.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
            : `$ ${data.summary.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
        }
      })
      .catch(() => {});
  }

  function checkoutWhatsApp() {
    if (cart.length === 0) {
      showToast('Tu carrito está vacío');
      return;
    }

    let totalSum = 0;
    let listText = '';

    cart.forEach(item => {
      const p = products.find(prod => prod.id === item.id);
      if (p) {
        const subtotal = currentCurrency === 'PEN' ? (p.pricePEN * item.qty) : (p.priceUSD * item.qty);
        totalSum += subtotal;
        const curLabel = currentCurrency === 'PEN' ? `S/. ${subtotal.toFixed(2)}` : `$ ${subtotal.toFixed(2)} USD`;
        listText += `• *${p.name}* x${item.qty} → ${curLabel}\n`;
      }
    });

    const totalFormatted = currentCurrency === 'PEN' ? `S/. ${totalSum.toFixed(2)} PEN` : `$ ${totalSum.toFixed(2)} USD`;

    const message = `⚡ *ORDEN DE PEDIDO / COTIZACIÓN MAQSYMA*\n` +
      `-----------------------------------------\n` +
      `¡Hola MAQSYMA! Deseo solicitar la compra/cotización formal de los siguientes equipos ESAB:\n\n` +
      `${listText}\n` +
      `*TOTAL ESTIMADO:* ${totalFormatted}\n` +
      `*Moneda:* ${currentCurrency}\n` +
      `-----------------------------------------\n` +
      `Por favor indíquenme disponibilidad para despacho inmediato, facturación y opciones de envío.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`, '_blank');
  }

  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer-overlay');
    if (drawer) drawer.classList.add('active');
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer-overlay');
    if (drawer) drawer.classList.remove('active');
  }

  // 6. Product Technical Specification Modal
  function openSpecModal(productId) {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    const modal = document.getElementById('spec-modal-overlay');
    const title = document.getElementById('modal-spec-title');
    const body = document.getElementById('modal-spec-body');

    if (title) title.textContent = p.name;
    if (body) {
      const featuresHTML = (p.features || []).map(f => `<li>${f}</li>`).join('');
      body.innerHTML = `
        <div class="modal-img-wrap">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div>
          <span class="badge-category" style="margin-bottom: 8px;">${p.categoryLabel || p.category}</span>
          <h3 style="font-family: var(--font-display); font-size: 24px; color: #fff; margin: 8px 0;">${p.name}</h3>
          <p style="color: var(--color-metal-300); font-size: 14px; margin-bottom: 16px;">${p.subtitle}</p>
          <div style="font-family: var(--font-display); font-size: 26px; color: var(--color-yellow-esab); font-weight: 800; margin-bottom: 18px;">
            ${formatPrice(p.priceUSD, p.pricePEN)}
            <span style="font-size: 13px; color: var(--color-metal-400); font-family: var(--font-mono); font-weight: normal;">${currentCurrency === 'PEN' ? 'PEN (IGV Inc.)' : '+ IVA'}</span>
          </div>

          <table class="modal-specs-table">
            <tr><td>Rango Amperaje:</td><td>${p.specs?.amperaje || 'N/A'}</td></tr>
            <tr><td>Ciclo de Trabajo:</td><td>${p.specs?.ciclo || 'N/A'}</td></tr>
            <tr><td>Voltaje de Entrada:</td><td>${p.specs?.voltaje || 'N/A'}</td></tr>
            <tr><td>Peso de Chasis:</td><td>${p.specs?.peso || 'N/A'}</td></tr>
            <tr><td>Disponibilidad:</td><td><strong style="color: ${p.stock > 0 ? '#4ade80' : '#ef4444'}">${p.stock > 0 ? `${p.stock} unidades en stock` : 'Agotado / Bajo pedido'}</strong></td></tr>
          </table>

          <ul class="modal-features-list">
            ${featuresHTML}
          </ul>
        </div>
      `;
    }

    const modalActionBtn = document.getElementById('modal-action-add');
    if (modalActionBtn) {
      modalActionBtn.onclick = () => {
        addToCart(p.id);
        closeSpecModal();
      };
      modalActionBtn.disabled = p.stock <= 0;
      modalActionBtn.textContent = p.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock';
    }

    if (modal) modal.classList.add('active');
  }

  function closeSpecModal() {
    const modal = document.getElementById('spec-modal-overlay');
    if (modal) modal.classList.remove('active');
  }

  // 7. Inventory & Stock Admin Panel (Protected by Server Session)
  let currentAdminUser = null;

  async function checkAdminSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          currentAdminUser = data.user;
          return true;
        }
      }
    } catch (e) {}
    currentAdminUser = null;
    return false;
  }

  async function openAdminModal() {
    const isAuthed = await checkAdminSession();
    if (!isAuthed) {
      window.location.href = 'admin-login.html';
      return;
    }

    const badge = document.getElementById('admin-user-badge');
    if (badge && currentAdminUser) {
      badge.textContent = `Sesión activa: ${currentAdminUser.email}`;
    }

    renderAdminTable();
    const modal = document.getElementById('admin-modal-overlay');
    if (modal) modal.classList.add('active');
  }

  function closeAdminModal() {
    const modal = document.getElementById('admin-modal-overlay');
    if (modal) modal.classList.remove('active');
  }

  async function handleAdminLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    currentAdminUser = null;
    closeAdminModal();
    showToast('Sesión cerrada');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }

  function renderAdminTable() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => {
      return `
        <tr>
          <td><img src="${p.image}" alt="" style="width: 44px; height: 38px; object-fit: contain; background: #161a22; border-radius: 4px; padding: 2px;"></td>
          <td><strong>${p.name}</strong><br><span style="font-size: 11px; color: var(--color-metal-400);">${p.category}</span></td>
          <td><input type="number" class="admin-input-small" value="${p.stock}" min="0" onchange="window.MAQSYMA.updateProductStock('${p.id}', this.value)"></td>
          <td><input type="number" class="admin-input-small" value="${p.priceUSD}" min="0" step="10" onchange="window.MAQSYMA.updateProductPriceUSD('${p.id}', this.value)"></td>
          <td><input type="number" class="admin-input-small" value="${p.pricePEN}" min="0" step="10" onchange="window.MAQSYMA.updateProductPricePEN('${p.id}', this.value)"></td>
          <td>
            <button class="btn-admin-action btn-admin-delete" onclick="window.MAQSYMA.deleteProduct('${p.id}')">Eliminar</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function updateProductStock(id, newStock) {
    const val = parseInt(newStock, 10);
    if (isNaN(val) || val < 0) {
      alert('El stock debe ser un entero mayor o igual a 0');
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: val })
      });
      if (!res.ok) {
        if (res.status === 401) {
          alert('Sesión expirada. Por favor inicie sesión nuevamente.');
          window.location.href = 'admin-login.html';
          return;
        }
        throw new Error('Error al actualizar en servidor');
      }
      const data = await res.json();
      const p = products.find(prod => prod.id === id);
      if (p) p.stock = val;
      renderCatalog();
      renderCommercialStations();
      showToast(`Stock actualizado en servidor: ${val}`);
    } catch (err) {
      console.error(err);
      showToast('Error al conectar con el servidor');
    }
  }

  async function updateProductPriceUSD(id, newPrice) {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val < 0) {
      alert('Precio USD inválido');
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, priceUSD: val })
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = 'admin-login.html';
          return;
        }
        throw new Error('Error al actualizar');
      }
      const p = products.find(prod => prod.id === id);
      if (p) p.priceUSD = val;
      renderCatalog();
      renderCommercialStations();
      showToast(`Precio USD actualizado: $${val}`);
    } catch (err) {
      showToast('Error al actualizar precio en servidor');
    }
  }

  async function updateProductPricePEN(id, newPrice) {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val < 0) {
      alert('Precio PEN inválido');
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pricePEN: val })
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = 'admin-login.html';
          return;
        }
        throw new Error('Error al actualizar');
      }
      const p = products.find(prod => prod.id === id);
      if (p) p.pricePEN = val;
      renderCatalog();
      renderCommercialStations();
      showToast(`Precio PEN actualizado: S/.${val}`);
    } catch (err) {
      showToast('Error al actualizar precio en servidor');
    }
  }

  async function deleteProduct(id) {
    if (!confirm('¿Confirmas que deseas eliminar este equipo del catálogo en servidor?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = 'admin-login.html';
          return;
        }
        throw new Error('Error eliminando producto');
      }

      products = products.filter(p => p.id !== id);
      renderAdminTable();
      renderCatalog();
      renderCommercialStations();
      showToast('Equipo eliminado del catálogo');
    } catch (err) {
      showToast('Error al eliminar equipo en el servidor');
    }
  }

  async function addNewProductFromAdmin() {
    const name = document.getElementById('new-prod-name')?.value.trim();
    const cat = document.getElementById('new-prod-category')?.value;
    const catLabel = document.getElementById('new-prod-label')?.value.trim() || cat.toUpperCase();
    const subtitle = document.getElementById('new-prod-subtitle')?.value.trim();
    const img = document.getElementById('new-prod-img')?.value.trim() || 'assets/products/esab_hero_clean.png';
    const priceUSD = parseFloat(document.getElementById('new-prod-usd')?.value) || 1000;
    const pricePEN = parseFloat(document.getElementById('new-prod-pen')?.value) || 3750;
    const stock = parseInt(document.getElementById('new-prod-stock')?.value) || 1;
    const amperaje = document.getElementById('new-prod-amp')?.value.trim() || '200 A';
    const ciclo = document.getElementById('new-prod-ciclo')?.value.trim() || '200 A @ 30%';

    if (!name) {
      alert('Por favor ingresa al menos el nombre del equipo');
      return;
    }

    const payload = {
      name,
      category: cat,
      categoryLabel: catLabel,
      subtitle: subtitle || 'Equipo Inversor Profesional ESAB',
      image: img,
      priceUSD,
      pricePEN,
      stock,
      specs: {
        amperaje,
        ciclo,
        voltaje: '220V 1ph / 3ph',
        peso: '12 kg'
      },
      features: [
        'Tecnología de arco inverso de alta eficiencia',
        'Garantía directa de 3 años MAQSYMA + ESAB',
        'Componentes industriales de protección térmica'
      ]
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = 'admin-login.html';
          return;
        }
        const errData = await res.json();
        alert(errData.error || 'Error creando producto');
        return;
      }

      const created = await res.json();
      products.unshift(created.product);
      renderAdminTable();
      renderCatalog();
      renderCommercialStations();
      showToast(`¡Equipo ${name} publicado en servidor con éxito!`);
      document.getElementById('adminAddForm').reset();
    } catch (err) {
      showToast('Error de comunicación con el servidor');
    }
  }

  function resetDefaultCatalog() {
    if (confirm('¿Restaurar el catálogo original de fábrica?')) {
      localStorage.removeItem(CONFIG.storageKeyProducts);
      products = [];
      loadProducts();
      renderAdminTable();
      showToast('Catálogo restablecido al estado original');
    }
  }

  // 8. Currency Toggle
  function setCurrency(cur) {
    currentCurrency = cur;
    localStorage.setItem(CONFIG.storageKeyCurrency, cur);
    document.querySelectorAll('.currency-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === cur);
    });
    renderCatalog();
    renderCommercialStations();
    updateCartUI();
  }

  // 9. Toast Notification
  function showToast(msg) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-yellow-esab)" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${msg}</span>
    `;
    toast.classList.add('active');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 2800);
  }

  // 10. Direct WhatsApp Quote Form in Section
  function populateQuoteSelect() {
    const select = document.getElementById('quote-model');
    if (!select) return;
    select.innerHTML = products.map(p => `<option value="${p.name}">${p.name} (${p.categoryLabel || p.category})</option>`).join('') +
      `<option value="Asesoría General">No estoy seguro / Requiero recomendación técnica</option>`;
  }

  function initWhatsAppDirectForm() {
    const btn = document.getElementById('btn-whatsapp-submit');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const model = document.getElementById('quote-model')?.value || 'Equipo ESAB';
      const usage = document.getElementById('quote-usage')?.value.trim() || 'Trabajo industrial / Taller';
      const city = document.getElementById('quote-city')?.value.trim() || 'Perú';

      const message = `¡Hola MAQSYMA! Requiero cotización formal y asesoría técnica para la máquina inversora:\n\n*Modelo:* ${model}\n*Aplicación/Uso:* ${usage}\n*Ubicación:* ${city}\n*Moneda de preferencia:* ${currentCurrency}\n\n¿Tienen disponibilidad para entrega y soporte de garantía?`;

      window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });
  }

  // Expose to window for inline onclick handlers
  window.MAQSYMA = {
    addToCart,
    updateQty,
    removeFromCart,
    openCartDrawer,
    closeCartDrawer,
    checkoutWhatsApp,
    openSpecModal,
    closeSpecModal,
    openAdminModal,
    closeAdminModal,
    handleAdminLogout,
    updateProductStock,
    updateProductPriceUSD,
    updateProductPricePEN,
    deleteProduct,
    addNewProductFromAdmin,
    setCurrency,
    scrollToStation
  };

  // =========================================================================
  // 10b. Intro Cinematográfico de Entrada — Secuencia Logo → Crossfade Video
  // =========================================================================
  function runCinematicIntro() {
    // Respetar prefers-reduced-motion: el overlay tiene display:none en ese caso vía CSS
    if (prefersReducedMotion) return;

    const overlay = document.getElementById('cinematicIntroOverlay');
    if (!overlay) return;

    // El overlay ya es visible (opacity:1) desde HTML.
    // Esperamos a que las animaciones CSS del logo/tagline terminen (~1.65s),
    // luego un dwell breve (~0.6s) y finalmente crossfade hacia el video.
    const ANIM_CSS_DURATION  = 1650; // ms que tardan los keyframes CSS
    const DWELL_DURATION     = 700;  // ms de pausa con logo visible
    const CROSSFADE_DURATION = 900;  // ms del fade-out del overlay

    setTimeout(() => {
      // Fase crossfade: el overlay hace fade out mientras el video ya estaba corriendo abajo
      overlay.classList.add('intro-done');

      // Después del fade, retiramos completamente el overlay del layout
      setTimeout(() => {
        overlay.style.display = 'none';
      }, CROSSFADE_DURATION + 100);

    }, ANIM_CSS_DURATION + DWELL_DURATION);
  }

  // 11. Initialization on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    runCinematicIntro();
    initHeroScrollSequence();
    loadProducts();
    loadCart();
    initWhatsAppDirectForm();

    // Comprobar parámetro ?admin=open tras login exitoso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'open') {
      openAdminModal();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Botón logout del admin
    document.getElementById('btn-admin-logout')?.addEventListener('click', handleAdminLogout);

    // Currency Switcher Buttons
    document.querySelectorAll('.currency-btn').forEach(btn => {
      btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
    });

    // Category Tabs Filter
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.getAttribute('data-filter') || 'all';
        renderCatalog();
      });
    });

    // Search Input
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderCatalog();
      });
    }

    // Header Cart & Admin buttons
    document.getElementById('btn-header-cart')?.addEventListener('click', openCartDrawer);
    document.getElementById('btn-close-cart')?.addEventListener('click', closeCartDrawer);
    document.getElementById('btn-header-admin')?.addEventListener('click', openAdminModal);
    document.getElementById('btn-close-admin')?.addEventListener('click', closeAdminModal);
    document.getElementById('btn-close-spec')?.addEventListener('click', closeSpecModal);

    // Navbar Scroll Style
    const nav = document.querySelector('.nav-container');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80 && nav) {
        nav.style.background = 'rgba(6, 7, 9, 0.94)';
        nav.style.borderColor = 'rgba(245, 196, 0, 0.35)';
      } else if (nav) {
        nav.style.background = 'rgba(11, 13, 17, 0.85)';
        nav.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }
    }, { passive: true });
  });

})();
