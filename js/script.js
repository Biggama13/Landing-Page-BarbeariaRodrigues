(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SCROLL-TRIGGER: reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- COUNT-UP ---------- */
  const fmt = new Intl.NumberFormat('pt-BR');
  const count = (el) => {
    const end = +el.dataset.count, sep = el.dataset.sep;
    if (reduce) { el.textContent = sep ? fmt.format(end) : end; return; }
    const dur = 1600, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = sep ? fmt.format(v) : v;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => { el.textContent = el.dataset.sep ? '0' : '0'; cio.observe(el); });

  /* ---------- SCROLL-LINKED ---------- */
  const root = document.documentElement;
  const nav = $('#nav'), bar = $('#progress'), fab = $('#fab'), hero = $('#heroContent');
  const layers = $$('[data-parallax]');
  let ticking = false;

  const update = () => {
    const y = window.scrollY, vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;      // barra de progresso
    root.style.setProperty('--shift', (-y * 0.35).toFixed(1));      // listras do divisor acompanham o scroll
    nav.classList.toggle('solid', y > 24);
    fab.classList.toggle('show', y > vh * 0.6);
    if (reduce) return;
    root.style.setProperty('--sy', y);                               // orbes do fundo acompanham o scroll
    layers.forEach((el) => {                                         // parallax por seção
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.parallax)).toFixed(1)}px,0)`;
    });
    const k = Math.min(y / (vh * 0.8), 1);                           // hero esmaece e sobe ao rolar
    hero.style.opacity = 1 - k * 0.9;
    hero.style.transform = `translateY(${(-k * 40).toFixed(1)}px)`;
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  /* ---------- SPOTLIGHT NOS CARDS GLASS ---------- */
  $$('.glass').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---------- MAPA ÚNICO COM SWITCH ENTRE UNIDADES ---------- */
  const sw = $('.switch'), tabs = $$('[role="tab"]', sw), frame = $('.map-frame'),
        addrEl = $('#mapAddr'), openEl = $('#mapOpen');
  const frames = new Map();
  const show = (i) => {
    const t = tabs[i], q = encodeURIComponent(t.dataset.maps);
    if (!frames.has(i)) {                                             // carrega cada mapa só quando for escolhido
      const f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=' + q + '&hl=pt-BR&z=17&output=embed';
      f.title = 'Mapa — Barbearia Rodrigues ' + t.textContent;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      f.addEventListener('load', () => { frame.style.animation = 'none'; });
      frame.appendChild(f); frames.set(i, f);
    }
    frames.forEach((f, k) => f.classList.toggle('active', k === i));
    tabs.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    sw.style.setProperty('--idx', i);
    addrEl.textContent = t.dataset.addr;
    openEl.href = 'https://www.google.com/maps/search/?api=1&query=' + q;
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => show(i));
    b.addEventListener('keydown', (e) => {                            // setas do teclado
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      show(n); tabs[n].focus();
    });
  });
  show(0);

  /* ---------- VOLTAR AO TOPO ---------- */
  $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
})();
