/* =========================================================
   Opening sequence (home page only)

   1. Black screen. ARUSHI / NADAR rise letter by letter through masks.
   2. A hairline draws across; small editorial labels appear.
   3. NADAR glides to the right edge — the composition shifts.
   4. The black curtain lifts from the top while each word flies
      into its place in the header logo and turns to ink.
   5. The home page content rises in behind it.

   - Skip with the button or the Escape key.
   - Never runs with prefers-reduced-motion.
   - Plays once, then not again for 12 hours (add ?intro to the URL to force it).
   ========================================================= */
(() => {
  const html = document.documentElement;
  const intro = document.getElementById('intro');
  const skipBtn = document.querySelector('.intro-skip');
  if (!intro) return;
  if (!html.classList.contains('intro-on')) { intro.remove(); skipBtn && skipBtn.remove(); return; }

  const STORAGE_KEY = 'an-intro-seen';
  const INK = '#121211';
  const LIGHT = '#F3EFE7';
  const E = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    io: 'cubic-bezier(0.76, 0, 0.24, 1)',
    glide: 'cubic-bezier(0.65, 0, 0.35, 1)'
  };

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const bg = intro.querySelector('.intro-bg');
  const nameEl = intro.querySelector('.intro-name');
  const line = intro.querySelector('.intro-line');
  const metas = [...intro.querySelectorAll('.im')];
  const words = [...intro.querySelectorAll('.iw')];
  const logoWords = [...document.querySelectorAll('.logo-w')];

  let timers = [];
  let anims = [];
  let phase = 0;          // 0 reveal · 1 glided · 2 collapsing · 3 done
  let glideX = 0;
  let finished = false;

  // --- split words into masked letters
  words.forEach((w) => {
    const text = w.textContent.trim();
    w.textContent = '';
    w.setAttribute('aria-hidden', 'true');
    [...text].forEach((c) => {
      const mask = document.createElement('span');
      mask.className = 'im-mask';
      const ch = document.createElement('span');
      ch.className = 'im-ch';
      ch.textContent = c;
      mask.appendChild(ch);
      w.appendChild(mask);
    });
  });
  const chars = words.map((w) => [...w.querySelectorAll('.im-ch')]);

  // --- size the name so it nearly touches the viewport edges
  function fit() {
    nameEl.style.fontSize = '100px';
    const avail = nameEl.clientWidth;
    const w0 = Math.max(...words.map((w) => w.getBoundingClientRect().width));
    const h0 = words[0].getBoundingClientRect().height;        // one line at 100px
    const byWidth = (100 * avail) / w0;
    const byHeight = (100 * window.innerHeight * 0.78) / (h0 * words.length);
    nameEl.style.fontSize = Math.floor(Math.min(byWidth, byHeight) * 0.995) + 'px';
    if (phase >= 1) {
      glideX = nameEl.clientWidth - words[1].getBoundingClientRect().width;
      words[1].style.transform = `translateX(${glideX}px)`;
    }
  }

  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const track = (a) => (anims.push(a), a);

  function play() {
    fit();
    const T0 = 180;

    // 1 · letters rise through their masks
    chars.forEach((list, wi) => {
      list.forEach((ch, i) => {
        track(ch.animate(
          [{ transform: 'translateY(108%)' }, { transform: 'translateY(0)' }],
          { duration: 1150, delay: T0 + wi * 240 + i * 58, easing: E.out, fill: 'both' }
        ));
      });
    });

    // 2 · hairline and labels
    track(line.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: 1500, delay: 650, easing: E.io, fill: 'both' }
    ));
    metas.forEach((m, i) => track(m.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay: 950 + i * 90, easing: E.out, fill: 'both' }
    )));

    // 3 · NADAR glides to the right edge
    at(1700, glide);
    // 4 · curtain lifts, name becomes the logo
    at(2750, collapse);
  }

  function glide() {
    if (finished) return;
    const target = nameEl.clientWidth - words[1].getBoundingClientRect().width;
    const a = track(words[1].animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${target}px)` }],
      { duration: 950, easing: E.glide, fill: 'forwards' }
    ));
    a.onfinish = () => {
      glideX = target;
      words[1].style.transform = `translateX(${glideX}px)`;
      a.cancel();
      phase = 1;
    };
  }

  function collapse() {
    if (finished) return;
    phase = 2;
    const DUR = 1300;

    // labels, hairline and skip button step back first
    [...metas, line, skipBtn].forEach((el) => el && track(el.animate(
      [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }],
      { duration: 350, easing: 'ease', fill: 'forwards' }
    )));

    // curtain lifts from the top, so words rise into daylight
    track(bg.animate(
      [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }],
      { duration: DUR, delay: 60, easing: E.io, fill: 'forwards' }
    ));

    // FLIP each word into its logo slot
    let last;
    words.forEach((w, i) => {
      // read wherever the word is right now (the glide may still be settling)
      const m = new DOMMatrixReadOnly(getComputedStyle(w).transform);
      const startX = m.m41;
      w.getAnimations().forEach((a) => a.cancel());
      w.style.transform = `translateX(${startX}px)`;
      const s = w.getBoundingClientRect();
      const t = logoWords[i].getBoundingClientRect();
      const k = t.width / s.width;
      const dx = startX + (t.left - s.left);
      const dy = (t.top + t.height / 2) - (s.top + (s.height * k) / 2);
      last = track(w.animate(
        [
          { transform: `translate(${startX}px, 0) scale(1)`, color: LIGHT },
          { color: LIGHT, offset: 0.3 },
          { transform: `translate(${dx}px, ${dy}px) scale(${k})`, color: INK }
        ],
        { duration: DUR, delay: i * 80, easing: E.io, fill: 'forwards' }
      ));
    });

    // release the page content while the curtain passes
    at(420, () => html.classList.remove('intro-hold'));
    last.onfinish = finish;
  }

  function finish() {
    if (finished) return;
    finished = true;
    phase = 3;
    timers.forEach(clearTimeout);
    html.classList.remove('intro-hold');
    html.classList.remove('intro-on');
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
    // let the logo take over before removing the overlay
    requestAnimationFrame(() => {
      intro.remove();
      skipBtn && skipBtn.remove();
      anims = [];
    });
    document.dispatchEvent(new CustomEvent('intro:done'));
  }

  function skip() {
    if (finished) return;
    if (phase === 2) { anims.forEach((a) => { try { a.finish(); } catch (e) {} }); finish(); return; }
    timers.forEach(clearTimeout);
    timers = [];
    html.classList.remove('intro-hold');
    const a = intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease', fill: 'forwards' });
    skipBtn && skipBtn.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
    a.onfinish = finish;
  }

  skipBtn && skipBtn.addEventListener('click', skip);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') skip(); });
  window.addEventListener('resize', () => { if (phase < 2) fit(); });

  // failsafe: never trap the visitor
  setTimeout(() => { if (!finished) skip(); }, 9000);

  // wait for the display font (briefly) so the fit is exact
  const fontReady = document.fonts && document.fonts.load
    ? Promise.race([document.fonts.load('700 100px Jost'), new Promise((r) => setTimeout(r, 1400))])
    : Promise.resolve();
  fontReady.then(() => requestAnimationFrame(play));
})();
