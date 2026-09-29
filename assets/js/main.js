/* ═══════════════════════════════════════════════════════
   CIRCLE AGENCY — interazioni
   Nessuna dipendenza. ~3kb.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── header: stato "stuck" allo scroll ─────────────── */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── menu mobile ───────────────────────────────────── */
  const burger = $('#burger');
  const links  = $('#navlinks');

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    links.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () =>
    setMenu(burger.getAttribute('aria-expanded') !== 'true')
  );
  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ─── reveal on scroll ──────────────────────────────── */
  const targets = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ─── spotlight che segue il cursore sulle card ─────── */
  if (!reduced && matchMedia('(hover: hover)').matches) {
    $$('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ─── FAQ: una alla volta ───────────────────────────── */
  const faqs = $$('.faq details');
  faqs.forEach((d) =>
    d.addEventListener('toggle', () => {
      if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
    })
  );

  /* ─── chip servizi ──────────────────────────────────── */
  const chips = $('#chips');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) b.classList.toggle('on');
  });

  const picked = () =>
    $$('#chips button.on').map((b) => b.dataset.v.replace('&amp;', '&'));

  /* ─── form → mailto precompilato ────────────────────────
     Nessun backend richiesto: apre il client di posta con
     tutto già scritto. Per un invio server-side sostituisci
     questo handler con un POST verso Formspree / Resend /
     una tua API.                                          */
  const form = $('#form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const f = new FormData(form);
    const g = (k) => (f.get(k) || '').toString().trim();
    const servizi = picked();

    const body = [
      `Nome:      ${g('nome')}`,
      `Email:     ${g('email')}`,
      `Telefono:  ${g('tel') || '—'}`,
      `Data:      ${g('data') || 'da definire'}`,
      `Servizi:   ${servizi.length ? servizi.join(', ') : 'da definire'}`,
      '',
      'Messaggio:',
      g('msg') || '—',
    ].join('\n');

    const subject = `Richiesta preventivo — ${g('nome') || 'nuovo contatto'}`;
    location.href =
      `mailto:info@circleagency.it?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  });

  /* ─── WhatsApp con messaggio precompilato ───────────── */
  const wa = $('#waBtn');
  wa.addEventListener('click', () => {
    const f = new FormData(form);
    const g = (k) => (f.get(k) || '').toString().trim();
    const servizi = picked();

    const parts = ['Ciao Circle! Vorrei un preventivo.'];
    if (g('data'))       parts.push(`Data: ${g('data')}`);
    if (servizi.length)  parts.push(`Servizi: ${servizi.join(', ')}`);
    if (g('msg'))        parts.push(g('msg'));

    wa.href = `https://wa.me/393347377797?text=${encodeURIComponent(parts.join('\n'))}`;
  });

  /* ─── anno nel footer ───────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();
})();
