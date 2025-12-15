// Interactivity: modal, timeline, gallery lightbox, skills carousel, particles
(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  // start page hidden for fade-in
  try { document.body.classList.add('page-fade-enter'); } catch (e) {}

  // Overlay and modal
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('modal');
  function openModal(html) {
    if (!overlay || !modal) return;
    overlay.hidden = false; overlay.style.display = 'block';
    modal.innerHTML = html; modal.setAttribute('aria-hidden', 'false'); modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // focus first focusable element
    const focusable = modal.querySelector('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }
  function closeModal() {
    if (!overlay || !modal) return;
    overlay.hidden = true; overlay.style.display = 'none';
    modal.innerHTML = ''; modal.setAttribute('aria-hidden', 'true'); modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  overlay?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Unified handler: any element with `data-journal` opens the corresponding journal modal.
  const journalData = {
    'journal-company-1': { title: 'World Tech Solution', img: 'assets/images/journal1.svg', text: 'Visit notes and highlights from World Tech Solution.' },
    'journal-company-2': { title: 'CodeChum', img: 'assets/images/journal2.svg', text: 'Community mentoring and workshop summary from CodeChum.' },
    'journal-company-3': { title: 'Rivan IT', img: 'assets/images/journal3.svg', text: 'Cloud and managed services insights from Rivan IT.' },
    'journal-company-4': { title: 'Mata', img: 'assets/images/journal4.svg', text: 'Design and UX findings from Mata.' },
    'journal-company-5': { title: 'Tarsier 117', img: 'assets/images/tarsier117.png', text: 'Hardware and logistics notes from Tarsier 117.' },
    'cebu-itinerary': { title: 'Cebu Itinerary', img: 'assets/images/tarsier117.png', text: 'Full itinerary and downloadable PDF for the Cebu–Bohol tour.' }
  };

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-journal]');
    if (!target) return;
    const key = target.dataset.journal;
    const entry = journalData[key] || journalData['cebu-itinerary'];
    const html = `<div style="max-width:880px"><button class="modal-close btn btn-sm btn-outline-light" aria-label="Close">Close</button><h2>${entry.title}</h2><p>${entry.text}</p><div style="text-align:center;margin-top:12px"><img src="${entry.img}" alt="${entry.title}" style="max-width:80%;max-height:70vh;height:auto;border-radius:8px;"/></div><p style="margin-top:12px">Download: <a href="#" onclick="return false;">${entry.title.replace(/\s+/g,'-')}-itinerary.pdf</a></p></div>`;
    openModal(html);
    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
  });

  // Hide preloader on load
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    if (pre) {
      pre.classList.add('loaded');
      setTimeout(() => { pre.hidden = true; pre.style.display = 'none'; }, 450);
    }
    // fade page in
    setTimeout(() => { document.body.classList.remove('page-fade-enter'); }, 20);
    // start typed name animation
    try { initTypedName(); } catch (e) {}
  });

  // Scroll reveal: apply subtle slide+fade animations using IntersectionObserver
  (function initReveal() {
    // selectors for major sections and UI components to animate
    const selectors = [
      '.reveal', 'header.site-header', '.hero', 'section', '.skill-item', '.cert-card', '.gallery-item', '.tour-card', '.logo-btn', '.highlight-main', '.itinerary-center'
    ];
    const nodeSet = new Set();
    selectors.forEach(sel => Array.from(document.querySelectorAll(sel)).forEach(n => nodeSet.add(n)));
    const els = Array.from(nodeSet);
    if (!els.length) return;

    // ensure elements have base reveal class (so CSS initial state applies)
    els.forEach(el => {
      if (!el.classList.contains('reveal')) el.classList.add('reveal');
      // allow per-element direction via data-reveal="left|right|up|down" or class reveal--left etc.
      const dir = el.dataset.reveal;
      if (dir && !el.classList.contains(`reveal--${dir}`)) el.classList.add(`reveal--${dir}`);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // if element has data-stagger attribute, animate children with small stagger
        if (el.hasAttribute('data-stagger')) {
          const gap = Number(el.dataset.stagger) || 60;
          Array.from(el.children).forEach((child, i) => {
            child.style.transitionDelay = `${i * gap}ms`;
            child.classList.add('active');
          });
          el.classList.add('active');
        } else {
          // support per-element delay in ms
          const delay = Number(el.dataset.revealDelay) || 0;
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add('active');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(el => io.observe(el));
  })();

  // Tours page slider (autoplay, seamless loop, modal preview)
  (function initToursSlider() {
    const slider = document.getElementById('tourSlider');
    if (!slider) return;
    const viewport = slider.querySelector('.slider-viewport');
    const track = slider.querySelector('.slider-track');
    if (!track || !viewport) return;
    let slides = Array.from(track.children);
    if (slides.length === 0) return;

    // ensure gallery main has bg layers initialized from inline style or first slide
    const galleryMain = document.getElementById('galleryMain');
    function ensureBgLayers(initialSrc) {
      if (!galleryMain) return;
      let layers = Array.from(galleryMain.querySelectorAll('.bg-layer'));
      if (layers.length < 2) {
        galleryMain.innerHTML = '';
        const a = document.createElement('div'); a.className = 'bg-layer visible';
        const b = document.createElement('div'); b.className = 'bg-layer';
        galleryMain.appendChild(a); galleryMain.appendChild(b);
        layers = [a, b];
      }
      const visible = layers.find(l => l.classList.contains('visible')) || layers[0];
      visible.style.backgroundImage = `url(${initialSrc})`;
      visible.classList.add('visible');
      galleryMain.dataset.currentBg = initialSrc;
    }
    if (galleryMain) {
      let initialBg = '';
      if (galleryMain.style && galleryMain.style.backgroundImage) {
        initialBg = galleryMain.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      }
      if (!initialBg) {
        const firstImg = slides[0].querySelector('img');
        initialBg = firstImg ? firstImg.src : '';
      }
      if (initialBg) ensureBgLayers(initialBg);
    }

    // build dots
    const dotsWrap = document.getElementById('tourDots');
    slides.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.index = i;
      dotsWrap.appendChild(btn);
    });

    let index = 0;
    function update() {
      slides = Array.from(track.children);
      const slide = slides[index];
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const viewportCenter = viewport.clientWidth / 2;
      const offset = slideCenter - viewportCenter;
      track.style.transform = `translateX(${-offset}px)`;
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      slides.forEach((s, i) => s.classList.toggle('inactive', i !== index));
      // update dots
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
      // update main gallery background using two layered bg elements
      const galleryMain = document.getElementById('galleryMain');
      const newSrc = slide.querySelector('img')?.src;
      if (galleryMain && newSrc) {
        // ensure two bg layers exist
        let layers = Array.from(galleryMain.querySelectorAll('.bg-layer'));
        if (layers.length < 2) {
          galleryMain.innerHTML = '';
          const a = document.createElement('div'); a.className = 'bg-layer visible';
          const b = document.createElement('div'); b.className = 'bg-layer';
          galleryMain.appendChild(a); galleryMain.appendChild(b);
          layers = [a, b];
        }
        const visible = layers.find(l => l.classList.contains('visible')) || layers[0];
        const hidden = layers.find(l => !l.classList.contains('visible')) || layers[1];
        const current = galleryMain.dataset.currentBg || (visible.style.backgroundImage ? visible.style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '') : '');
        if (current !== newSrc) {
          // prepare hidden layer with new image
          hidden.style.backgroundImage = `url(${newSrc})`;
          // starting scale for cinematic feel
          hidden.style.transform = 'scale(1.06)';
          // reveal hidden over visible
          requestAnimationFrame(() => {
            hidden.classList.add('visible');
            hidden.style.transform = 'scale(1)';
            visible.style.transform = 'scale(0.98)';
          });
          // after transition, hide the previous layer
          const tidy = () => {
            visible.classList.remove('visible');
            visible.style.transform = '';
            galleryMain.dataset.currentBg = newSrc;
            hidden.removeEventListener('transitionend', tidy);
          };
          hidden.addEventListener('transitionend', tidy);
          // fallback
          setTimeout(tidy, 800);
        }
      }
    }

    function go(delta) {
      index = (index + delta + slides.length) % slides.length;
      update();
    }

    // next/prev controls
    const prevBtn = document.getElementById('tourPrev');
    const nextBtn = document.getElementById('tourNext');
    prevBtn?.addEventListener('click', () => { go(-1); resetAutoplay(); });
    nextBtn?.addEventListener('click', () => { go(1); resetAutoplay(); });
    // dot clicks
    dotsWrap.querySelectorAll('button').forEach(b => b.addEventListener('click', (e) => { index = Number(e.currentTarget.dataset.index); update(); resetAutoplay(); }));

    // click to animate thumbnail -> main showcase
    track.addEventListener('click', (e) => {
      const slideEl = e.target.closest('.slide');
      if (!slideEl) return;
      const thumbImg = slideEl.querySelector('img');
      if (!thumbImg) return;
      // stop autoplay while animating
      stopAutoplay?.();

      const galleryMain = document.getElementById('galleryMain');
      if (!galleryMain) return;

      const thumbRect = thumbImg.getBoundingClientRect();
      const mainRect = galleryMain.getBoundingClientRect();

      // clone thumbnail -> animate to main (image element)
      const clone = thumbImg.cloneNode(true);
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${thumbRect.left}px`,
        top: `${thumbRect.top}px`,
        width: `${thumbRect.width}px`,
        height: `${thumbRect.height}px`,
        margin: '0',
        zIndex: 9999,
        borderRadius: window.getComputedStyle(thumbImg).borderRadius || '12px',
        transition: 'transform .6s cubic-bezier(.2,.9,.2,1), left .6s cubic-bezier(.2,.9,.2,1), top .6s cubic-bezier(.2,.9,.2,1), width .6s, height .6s, opacity .45s'
      });
      document.body.appendChild(clone);

      // create a faux main clone (div with current bg) to animate back to thumbnail
      const currentBg = galleryMain.dataset.currentBg || '';
      const cloneMain = document.createElement('div');
      Object.assign(cloneMain.style, {
        position: 'fixed',
        left: `${mainRect.left}px`,
        top: `${mainRect.top}px`,
        width: `${mainRect.width}px`,
        height: `${mainRect.height}px`,
        margin: '0',
        zIndex: 9998,
        borderRadius: getComputedStyle(galleryMain).borderRadius || '0px',
        backgroundImage: currentBg ? `url(${currentBg})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'transform .6s cubic-bezier(.2,.9,.2,1), left .6s, top .6s, width .6s, height .6s, opacity .45s'
      });
      document.body.appendChild(cloneMain);

      // trigger reflow then animate clones
      requestAnimationFrame(() => {
        Object.assign(clone.style, {
          left: `${mainRect.left}px`,
          top: `${mainRect.top}px`,
          width: `${mainRect.width}px`,
          height: `${mainRect.height}px`,
        });
        Object.assign(cloneMain.style, {
          left: `${thumbRect.left}px`,
          top: `${thumbRect.top}px`,
          width: `${thumbRect.width}px`,
          height: `${thumbRect.height}px`,
          opacity: '0.85'
        });
      });

      const finish = () => {
        // update gallery background via layers (reuse update logic)
        const clickedIndex = Array.from(track.children).indexOf(slideEl);
        index = (clickedIndex + slides.length) % slides.length;
        update();
        clone.remove();
        cloneMain.remove();
        // restart autoplay
        startAutoplay?.();
      };

      clone.addEventListener('transitionend', function handler() {
        clone.removeEventListener('transitionend', handler);
        finish();
      });
      setTimeout(() => { if (document.body.contains(clone)) finish(); }, 900);
    });

    // autoplay
    let autoplayId;
    function startAutoplay() { autoplayId = setInterval(() => go(1), 2800); }
    function stopAutoplay() { clearInterval(autoplayId); }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', startAutoplay);

    // initial layout
    update(); startAutoplay();
  })();

  // Tours timeline interactions (if present)
  const dots = document.querySelectorAll('.timeline-dot');
  const tourCards = document.querySelectorAll('.tour-card');
  if (dots.length && tourCards.length) {
    function setActive(index) {
      dots.forEach(d => d.classList.toggle('active', d.dataset.index == index));
      tourCards.forEach(c => {
        c.style.opacity = (c.dataset.day == index ? '1' : '0.35');
        c.style.transform = (c.dataset.day == index ? 'translateY(0)' : 'translateY(6px)');
      });
    }
    dots.forEach(d => d.addEventListener('click', () => setActive(d.dataset.index)));
    setActive(1);
  }

  // Tour 'Read More' buttons open modal with more detail
  document.querySelectorAll('.tour-card .more').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.dataset.day;
      openModal(`<div><button class="modal-close btn btn-sm btn-outline-light">Close</button><h2>Day ${day} — Full Itinerary</h2><p>Detailed itinerary and travel tips for day ${day}. Include transport, timings, and highlights.</p></div>`);
      modal.querySelector('.modal-close')?.addEventListener('click', () => { closeModal(); });
    });
  });

  // Gallery lightbox
  document.querySelectorAll('.gallery-item').forEach((b) => {
    b.addEventListener('click', () => {
      const img = b.querySelector('img');
      if (!img) return;
      openModal(`<div><button class="modal-close btn btn-sm btn-outline-light">Close</button><div style="text-align:center"><img src="${img.src}" alt="${img.alt}" style="max-width:80%;max-height:80vh;height:auto;border-radius:8px"/></div></div>`);
      modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    });
  });

  // Skills carousel: infinite autoplay without buttons
  (function initSkillsCarousel() {
    const track = document.querySelector('.skills-track');
    if (!track) return;
    const items = Array.from(track.children);
    if (items.length === 0) return;
    // duplicate items for seamless loop
    items.forEach(item => track.appendChild(item.cloneNode(true)));
    let pos = 0;
    const speed = 0.25; // px per frame (tweak for timing)
    let rafId;
    function step() {
      pos -= speed;
      // when scrolled past one set width, reset
      const firstItem = track.children[0];
      if (!firstItem) return;
      const resetPoint = firstItem.offsetWidth * items.length;
      if (Math.abs(pos) >= resetPoint) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      rafId = requestAnimationFrame(step);
    }
    // Pause on hover/focus
    track.addEventListener('mouseenter', () => cancelAnimationFrame(rafId));
    track.addEventListener('mouseleave', () => { rafId = requestAnimationFrame(step); });
    // start
    rafId = requestAnimationFrame(step);
  })();

  // Simple particle renderer (small gray dots) — optimized
  function initParticles() {
    const mount = document.getElementById('particles');
    if (!mount) return;
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%'; canvas.style.height = '100%';
    canvas.width = innerWidth; canvas.height = innerHeight; mount.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const particles = Array.from({ length: 48 }).map(() => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.6 + 0.3, vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, alpha: Math.random() * 0.5 }));
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    window.addEventListener('resize', resize);
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.fillStyle = `rgba(200,200,200,${p.alpha})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  }
  initParticles();

  // --- Typed name animation (looping type + delete) ---
  function initTypedName() {
    const el = document.getElementById('typed-name');
    if (!el) return;
    const text = 'Emjay Lauronal';
    let i = 0; let forward = true; let timer = null;
    function tick() {
      if (forward) {
        i++; el.textContent = text.slice(0, i);
        if (i === text.length) { forward = false; timer = setTimeout(tick, 900); return; }
        timer = setTimeout(tick, 80);
      } else {
        i--; el.textContent = text.slice(0, i);
        if (i === 0) { forward = true; timer = setTimeout(tick, 400); return; }
        timer = setTimeout(tick, 40);
      }
    }
    tick();
    // stop on page unload
    window.addEventListener('beforeunload', () => clearTimeout(timer));
  }

  // Page link fade-out navigation
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // ignore hashes and external/blank links
    if (href.startsWith('#') || a.target === '_blank' || href.indexOf('mailto:') === 0) return;
    // same-origin / relative navigation only
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    document.body.classList.add('page-fade-exit');
    setTimeout(() => { location.href = url.href; }, 420);
  });
})();