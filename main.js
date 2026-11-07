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

  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  // Escuchar cambios dinámicos en prefers-reduced-motion
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
    if (prefersReducedMotion) {
      if (heroTimeline) heroTimeline.pause(0);
      if (sparksRafId) {
        cancelAnimationFrame(sparksRafId);
        sparksRafId = null;
      }
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      if (!sparksRafId) loopSparks();
    }
  });

  // 2. High-Performance Mobile-Optimized Sparks Canvas
  const canvas = document.getElementById('sparksCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let sparks = [];
  let sparksIntensity = 0;
  let sparksRafId = null;
  let isHeroVisible = true;
  let isPageVisible = !document.hidden;

  // Límite de devicePixelRatio para prevenir calentamiento y consumo en móvil
  const maxDPR = isMobileDevice ? 1.5 : Math.min(window.devicePixelRatio || 1, 2);
  const maxSparksCount = isMobileDevice ? 65 : 200;

  function resizeCanvas() {
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * maxDPR);
    canvas.height = Math.floor(h * maxDPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (ctx) ctx.setTransform(maxDPR, 0, 0, maxDPR, 0, 0);
  }

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 200);
  }, { passive: true });
  resizeCanvas();

  class Spark {
    constructor(x, y, burst = false) {
      this.reset(x, y, burst);
    }
    reset(x, y, burst) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.x = x || w / 2;
      this.y = y || h * 0.52;
      const angle = (Math.random() * Math.PI * 2);
      const speed = burst ? (Math.random() * 12 + 3) : (Math.random() * 6 + 2);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (Math.random() * 3 + 1);
      this.gravity = 0.28;
      this.drag = 0.95;
      this.life = 0;
      this.maxLife = Math.random() * 30 + 18;
      this.size = Math.random() * 2.4 + 1.0;
      const r = Math.random();
      if (r < 0.6) this.color = '#F5C400';
      else if (r < 0.85) this.color = '#FFFFFF';
      else this.color = '#70D6FF';
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
      // Solo aplicar shadowBlur si no es dispositivo móvil (optimización de GPU móvil)
      if (!isMobileDevice) {
        context.shadowColor = this.color;
        context.shadowBlur = 8;
      }
      context.beginPath();
      context.arc(this.x, this.y, this.size * remaining, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  function loopSparks() {
    if (!ctx || !canvas || prefersReducedMotion || !isHeroVisible || !isPageVisible) {
      sparksRafId = null;
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (sparksIntensity > 0.05) {
      const factor = isMobileDevice ? 2.5 : 5.0;
      const count = Math.floor(sparksIntensity * factor);
      for (let i = 0; i < count; i++) {
        if (sparks.length < maxSparksCount) sparks.push(new Spark());
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.update();
      s.draw(ctx);
      if (s.life >= s.maxLife) sparks.splice(i, 1);
    }

    sparksRafId = requestAnimationFrame(loopSparks);
  }

  // Pausar y reanudar eficientemente al cambiar pestaña
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible && isHeroVisible && !sparksRafId && !prefersReducedMotion) {
      loopSparks();
    }
  });

  // Pausar partículas mediante IntersectionObserver cuando la sección Hero sale de pantalla
  const heroSection = document.querySelector('.hero-scroll-container');
  if (heroSection && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && isPageVisible && !sparksRafId && !prefersReducedMotion) {
          loopSparks();
        }
      });
    }, { threshold: 0.05 });
    heroObserver.observe(heroSection);
  }

  if (!prefersReducedMotion) loopSparks();

  // 3. Hero 500vh GSAP Scroll Sequence
  let heroTimeline = null;
  function initHeroScrollSequence() {
    if (prefersReducedMotion) return;

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

    if (!heroContainer || !machine) return;

    // Limpieza de timelines previos si existían
    if (heroTimeline) heroTimeline.kill();

    gsap.set([slide1, slide2, slide3, slide4], { opacity: 0, y: 40 });
    gsap.set(machine, { opacity: 0, scale: 0.75, rotationY: isMobileDevice ? 0 : -15 });
    gsap.set(arcLight, { opacity: 0, scale: 0.4 });
    gsap.set(welderBg, { opacity: 0 });
    gsap.set(hotspots, { opacity: 0 });

    heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: isMobileDevice ? 0.3 : 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          if (telemetryFill) telemetryFill.style.width = `${(p * 100).toFixed(1)}%`;
          if (telemetryStep) {
            if (p < 0.25) telemetryStep.textContent = '01 / IGNICIÓN ARCO';
            else if (p < 0.55) telemetryStep.textContent = '02 / INVERSORA ESAB';
            else if (p < 0.82) telemetryStep.textContent = '03 / MICRO-CONTROL PFC';
            else telemetryStep.textContent = '04 / MAQSYMA EXPERT';
          }
        }
      }
    });

    heroTimeline
      // Phase 1: Ignition
      .to({ intensity: 0 }, {
        intensity: 1.0, duration: 0.15,
        onUpdate: function () { sparksIntensity = this.targets()[0].intensity; }
      }, 0)
      .to(arcLight, { opacity: 0.95, scale: 1.3, duration: 0.15 }, 0)
      .to(welderBg, { opacity: 0.55, duration: 0.18 }, 0.02)
      .to(slide1, { opacity: 1, y: 0, duration: 0.12 }, 0.04)
      .to(slide1, { opacity: 0, y: -35, duration: 0.08 }, 0.20)
      // Phase 2: Machine reveal
      .to(machine, { opacity: 1, scale: 1.0, rotationY: 0, duration: 0.25 }, 0.22)
      .to(arcLight, { opacity: 0.45, scale: 1.0, duration: 0.2 }, 0.22)
      .to({ intensity: 1.0 }, {
        intensity: 0.35, duration: 0.2,
        onUpdate: function () { sparksIntensity = this.targets()[0].intensity; }
      }, 0.22)
      .to(slide2, { opacity: 1, y: 0, duration: 0.14 }, 0.26)
      .to(slide2, { opacity: 0, y: -35, duration: 0.08 }, 0.48)
      // Phase 3: Zoom and details
      .to(machine, { scale: 1.35, x: isMobileDevice ? '-3%' : '-8%', y: '5%', duration: 0.24 }, 0.50)
      .to(hotspots, { opacity: 1, duration: 0.12 }, 0.52)
      .to(slide3, { opacity: 1, y: 0, duration: 0.14 }, 0.53)
      .to(hotspots, { opacity: 0, duration: 0.08 }, 0.72)
      .to(slide3, { opacity: 0, y: -35, duration: 0.08 }, 0.74)
      // Phase 4: MAQSYMA Authority
      .to(machine, { scale: 0.95, x: '0%', y: '0%', opacity: 0.85, duration: 0.20 }, 0.76)
      .to(welderBg, { opacity: 0.15, duration: 0.18 }, 0.76)
      .to({ intensity: 0.35 }, {
        intensity: 0.0, duration: 0.20,
        onUpdate: function () { sparksIntensity = this.targets()[0].intensity; }
      }, 0.76)
      .to(slide4, { opacity: 1, y: 0, duration: 0.16 }, 0.80);
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
    setCurrency
  };

  // 11. Initialization on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
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
