/* =========================================================
   Shared behaviour for every page
   - word-by-word headline reveals ([data-split])
   - scroll reveals ([data-reveal])
   - header that hides on scroll down, returns on scroll up
   - floating image preview on the home work list
   - soft page-to-page transitions
   ========================================================= */
(() => {
  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- split headlines into masked words
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words
      .map((w, i) => `<span class="w" aria-hidden="true"><span class="wi" style="--wi:${i}">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></span>`)
      .join(' ');
  });

  // ---- scroll reveals
  const targets = document.querySelectorAll('[data-reveal], [data-split]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
  }

  // ---- header behaviour
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    if (header && !html.classList.contains('intro-on')) {
      header.classList.toggle('is-solid', y > 40);
      header.classList.toggle('is-hidden', y > 200 && y > lastY + 2);
      if (y < lastY - 2) header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  // ---- floating preview on the home work list (mouse only)
  const list = document.querySelector('.work-list');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (list && fine && !reduce) {
    const preview = document.createElement('div');
    preview.className = 'preview';
    preview.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = '';
    preview.appendChild(img);
    document.body.appendChild(preview);

    let x = 0, y = 0, cx = 0, cy = 0, s = 0.85, ts = 0.85, raf = null;
    const loop = () => {
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      s += (ts - s) * 0.12;
      preview.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${s})`;
      raf = requestAnimationFrame(loop);
    };
    list.querySelectorAll('.wl-row').forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        img.src = row.dataset.preview;
        preview.style.background = row.dataset.previewBg || '';
        img.style.objectFit = row.dataset.previewFit || 'cover';
        if (!raf) { cx = x = e.clientX; cy = y = e.clientY; loop(); }
        ts = 1;
        preview.classList.add('is-on');
      });
      row.addEventListener('mouseleave', () => { ts = 0.85; preview.classList.remove('is-on'); });
    });
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  }

  // ---- page transitions
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || reduce) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;   // same-page anchor
    if (a.getAttribute('href').startsWith('mailto:')) return;
    e.preventDefault();
    html.classList.add('is-leaving');
    setTimeout(() => { location.href = a.href; }, 420);
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) html.classList.remove('is-leaving'); });

  // ---- footer year
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
