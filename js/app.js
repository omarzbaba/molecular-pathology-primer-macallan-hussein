/* Page chrome and start-up: theme, navigation, reveal, session clock, search. */
(function (MP) {
  'use strict';
  const { el, $, $$ } = MP;

  /* ---------- theme ---------- */
  function initTheme() {
    const button = $('#themeBtn');
    if (button) button.addEventListener('click', () => MP.setTheme(MP.theme() === 'dark' ? 'light' : 'dark'));
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (MP.reduced() || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('in'));
      return;
    }
    let reported = false;
    const observer = new IntersectionObserver((entries) => {
      reported = true;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.04 });
    items.forEach((item) => observer.observe(item));
    // Fail-safe: an observer always reports once on start. If it never does
    // (a page rendered in the background, or printed), show everything.
    window.setTimeout(() => {
      if (reported) return;
      observer.disconnect();
      items.forEach((item) => item.classList.add('in'));
    }, 3000);
  }

  /* ---------- scroll: progress line, active section, back-to-top ---------- */
  let activeId = '';
  function initScroll() {
    const sections = $$('main .section');
    const navItems = $$('.nav-item');
    const bar = $('#scrollBar');
    const crumb = $('#crumb');
    const toTop = $('#toTop');
    let queued = false;

    function update() {
      queued = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      if (toTop) toTop.hidden = window.scrollY < 600;
      let current = sections[0];
      sections.forEach((section) => { if (section.getBoundingClientRect().top <= 170) current = section; });
      if (!current || current.id === activeId) return;
      activeId = current.id;
      navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.nav === activeId));
      if (crumb) crumb.textContent = current.dataset.title || '';
      MP.emit('section', activeId);
    }
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0 }));
    update();
  }

  /* ---------- mobile drawer ---------- */
  const DRAWER_QUERY = '(max-width: 1080px)'; // matches the breakpoint in base.css
  function initDrawer() {
    const button = $('#menuBtn');
    const sidebar = $('#sidebar');
    const content = $('.content');
    if (!button || !sidebar) return;
    const isOpen = () => document.body.classList.contains('nav-open');

    function setOpen(open, returnFocus) {
      if (open === isOpen()) return;
      document.body.classList.toggle('nav-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      if (content) content.inert = open; // keep Tab and screen readers inside the open drawer
      if (open) {
        const first = sidebar.querySelector('a, button');
        if (first) first.focus();
      } else if (returnFocus) {
        button.focus();
      }
    }
    button.addEventListener('click', () => setOpen(!isOpen(), true));
    $$('.nav-item, .brand').forEach((link) => link.addEventListener('click', () => setOpen(false, false)));
    document.addEventListener('click', (event) => {
      if (!isOpen()) return;
      if (event.target.closest('.sidebar') || event.target.closest('#menuBtn')) return;
      setOpen(false, true);
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && isOpen()) setOpen(false, true); });
    // Widening past the breakpoint turns the drawer back into a fixed sidebar.
    const media = window.matchMedia(DRAWER_QUERY);
    const onChange = () => { if (!media.matches) setOpen(false, false); };
    if (media.addEventListener) media.addEventListener('change', onChange);
  }

  /* ---------- deep links: open any drawer that holds the target ---------- */
  function openForHash() {
    let id = '';
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (err) { return; }
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    let opened = false;
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS' && !node.open) { node.open = true; opened = true; }
    }
    if (opened) target.scrollIntoView({ block: 'start' });
  }

  /** Go to a section. Setting an unchanged hash fires no event, so that case is handled directly. */
  function goTo(hash) {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
      return;
    }
    openForHash();
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ block: 'start' });
  }

  /* ---------- session clock ---------- */
  const HOLD_TO_RESET_MS = 700;
  function initTimer() {
    const button = $('#timer');
    const text = $('#timerText');
    const plan = $('#timerPlan');
    if (!button || !text) return;
    const KEY = 'mpp.timer';
    const total = MP.data.totalMinutes;
    let clock = { running: false, banked: 0, since: 0 };
    let plannedSoFar = MP.data.stops[0].min;
    let tick = 0;

    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (saved && Number.isFinite(saved.banked) && Number.isFinite(saved.since)) {
        clock = { running: saved.running === true, banked: Math.max(0, saved.banked), since: saved.since };
      }
    } catch (err) { /* no session storage: the clock simply starts at zero */ }

    const elapsed = () => clock.banked + (clock.running ? Date.now() - clock.since : 0);
    const persist = () => { try { sessionStorage.setItem(KEY, JSON.stringify(clock)); } catch (err) { /* ignore */ } };
    function paint() {
      const seconds = Math.floor(elapsed() / 1000);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = String(seconds % 60).padStart(2, '0');
      text.textContent = h ? h + ':' + String(m).padStart(2, '0') + ':' + s : m + ':' + s;
      button.classList.toggle('is-on', clock.running);
      button.classList.toggle('is-over', seconds / 60 > plannedSoFar);
      button.setAttribute('aria-label', 'Session clock, ' + text.textContent + ' elapsed, ' + (clock.running ? 'running' : 'paused') +
        '. Press to start or pause. Press Delete, or press and hold, to reset.');
    }
    function setRunning(run) {
      clock = run ? { running: true, banked: clock.banked, since: Date.now() } : { running: false, banked: elapsed(), since: 0 };
      window.clearInterval(tick);
      if (run) tick = window.setInterval(paint, 1000);
      persist();
      paint();
    }
    function reset() {
      window.clearInterval(tick);
      clock = { running: false, banked: 0, since: 0 };
      persist();
      paint();
    }
    // Reset three ways, so it never depends on a double-click: double-click, press and hold, or Delete.
    let holdTimer = 0;
    let held = false;
    const cancelHold = () => window.clearTimeout(holdTimer);
    button.addEventListener('pointerdown', () => {
      held = false;
      holdTimer = window.setTimeout(() => { held = true; reset(); }, HOLD_TO_RESET_MS);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((type) => button.addEventListener(type, cancelHold));
    button.addEventListener('click', () => {
      if (held) { held = false; return; } // the press that reset the clock should not restart it
      setRunning(!clock.running);
    });
    button.addEventListener('dblclick', reset);
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      event.preventDefault();
      reset();
    });
    MP.on('section', (id) => {
      const index = MP.data.stops.findIndex((stop) => stop.id === id);
      plannedSoFar = index < 0 ? total : MP.data.stops.slice(0, index + 1).reduce((sum, stop) => sum + stop.min, 0);
      if (plan) plan.textContent = index < 0 ? 'of ' + total + ' min' : 'plan ' + plannedSoFar + ' of ' + total;
      paint();
    });
    if (clock.running) tick = window.setInterval(paint, 1000);
    paint();
  }

  /* ---------- search palette ---------- */
  function initPalette() {
    const dialog = $('#palette');
    const input = $('#palInput');
    const list = $('#palList');
    const status = $('#palStatus');
    const opener = $('#searchBtn');
    if (!dialog || !input || !list || typeof dialog.showModal !== 'function') {
      if (opener) opener.hidden = true;
      return;
    }
    let index = null;
    let results = [];
    let cursor = 0;

    function fill(inputSel, value, hash) {
      return () => {
        // A site filter left on in the atlas would hide the marker that was just chosen.
        if (inputSel === '#atlasSearch' && MP.showAllAtlasSites) MP.showAllAtlasSites();
        const field = $(inputSel);
        if (field) { field.value = value; field.dispatchEvent(new Event('input', { bubbles: true })); }
        goTo(hash);
      };
    }
    function buildIndex() {
      // [title, lab name, where it lives]; each lab mount carries the id "lab-<name>".
      const labs = [['Mutation lab', 'mutation', 'Stop 1'], ['Tumor cellularity estimator', 'cellularity', 'Stop 2'], ['PCR cycler', 'pcr', 'Stop 3'],
        ['Real-time PCR explorer', 'qpcr', 'Stop 3'], ['Read pileup', 'pileup', 'Stop 4'], ['Sanger chromatogram reader', 'chroma', 'Stop 4 · go deeper'],
        ['Which test can see it?', 'whichtest', 'Stop 5'], ['FISH simulator', 'fish', 'Stop 5'], ['Annotated report', 'report', 'Stop 6'],
        ['Mismatch-repair board', 'mmr', 'Stop 7'], ['Repeat ruler', 'repeat', 'Stop 8 · go deeper']];
      const own = [['Case lab', 'cases'], ['Question bank', 'bank'], ['Biomarker atlas', 'atlas'], ['Reference tables', 'reference'], ['Glossary', 'glossary']];
      return [].concat(
        MP.data.stops.map((s) => ({ kind: 'Stop ' + s.n, title: s.title, sub: s.sub, go: () => goTo('#' + s.id) })),
        labs.map((l) => ({ kind: 'Lab', title: l[0], sub: l[2], go: () => goTo('#lab-' + l[1]) })),
        own.map((o) => ({ kind: 'On your own', title: o[0], sub: '', go: () => goTo('#' + o[1]) })),
        MP.data.reference.map((r) => ({ kind: 'Table', title: r.title, sub: r.sub, go: () => goTo('#ref-' + r.id) })),
        MP.data.glossary.map((g) => ({ kind: 'Term', title: g.term + (g.abbr ? ' (' + g.abbr + ')' : ''), sub: g.def, go: fill('#glossSearch', g.term, '#glossary') })),
        MP.data.atlas.map((a) => ({ kind: 'Biomarker', title: a.marker, sub: a.site, go: fill('#atlasSearch', a.marker, '#atlas') })));
    }
    function paint() {
      list.replaceChildren(...results.map((item, i) => {
        const row = el('li', { class: 'pal-item', role: 'option', id: 'pal-option-' + i, 'aria-selected': String(i === cursor) },
          el('span', { class: 'pal-kind', text: item.kind }), el('span', { class: 'pal-title', text: item.title }),
          item.sub ? el('span', { class: 'pal-sub', text: item.sub }) : null);
        row.addEventListener('click', () => choose(i));
        return row;
      }));
      if (results.length) input.setAttribute('aria-activedescendant', 'pal-option-' + cursor);
      else input.removeAttribute('aria-activedescendant');
      // The count (or "nothing found") is spoken from a status line, outside the listbox.
      if (status) {
        status.textContent = results.length ? results.length + (results.length === 1 ? ' result' : ' results') : 'Nothing found.';
        status.classList.toggle('is-empty', !results.length);
      }
      const selected = list.children[cursor];
      if (selected && selected.scrollIntoView) selected.scrollIntoView({ block: 'nearest' });
    }
    function search() {
      const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      const pool = index || [];
      results = (words.length
        ? pool.filter((item) => words.every((w) => (item.kind + ' ' + item.title + ' ' + item.sub).toLowerCase().includes(w)))
        : pool.filter((item) => item.kind.startsWith('Stop'))).slice(0, 12);
      cursor = 0;
      paint();
    }
    function choose(i) {
      const item = results[i];
      if (!item) return;
      dialog.close();
      item.go();
    }
    function open() {
      if (!index) index = buildIndex();
      input.value = '';
      search();
      dialog.showModal();
      input.focus();
    }
    opener.addEventListener('click', open);
    input.addEventListener('input', search);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { cursor = Math.min(cursor + 1, results.length - 1); paint(); event.preventDefault(); }
      else if (event.key === 'ArrowUp') { cursor = Math.max(cursor - 1, 0); paint(); event.preventDefault(); }
      else if (event.key === 'Enter') { choose(cursor); event.preventDefault(); }
    });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    document.addEventListener('keydown', (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((event.target && event.target.tagName) || '');
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (dialog.open) dialog.close(); else open(); }
      else if (event.key === '/' && !typing && !dialog.open) { event.preventDefault(); open(); }
    });
  }

  /* ---------- helix temperature read-out (works with or without WebGL) ---------- */
  function initHelixReadout() {
    const slider = $('#helixTemp');
    const tempOut = $('#helixTempVal');
    const stateOut = $('#helixState');
    if (!slider || !stateOut) return;
    const states = [
      { below: 60, name: 'paired', text: '<strong>Paired.</strong> A pairs with T, G pairs with C. Hydrogen bonds hold the two strands together.' },
      { below: 75, name: 'loosening', text: '<strong>Loosening.</strong> A–T pairs, held by two hydrogen bonds, open before G–C pairs, held by three. GC-rich DNA melts at a higher temperature.' },
      { below: 90, name: 'melting', text: '<strong>Melting.</strong> The strands are coming apart.' },
      { below: Infinity, name: 'denatured', text: '<strong>Denatured.</strong> Two single strands, each free to meet a primer or a probe. Cool it and they find each other again — that is annealing.' }
    ];
    let shown = '';
    function describe() {
      const temperature = Number(slider.value);
      const state = states.find((s) => temperature < s.below);
      if (tempOut) tempOut.textContent = temperature + ' °C';
      slider.setAttribute('aria-valuetext', temperature + ' degrees Celsius, ' + state.name);
      if (state.name !== shown) { shown = state.name; stateOut.innerHTML = state.text; }
    }
    slider.addEventListener('input', describe);
    describe();
  }

  /* ---------- start ---------- */
  function start() {
    const steps = [
      ['content', MP.renderContent], ['practice', MP.renderPractice], ['labs', MP.mountLabs],
      ['theme', initTheme], ['drawer', initDrawer], ['timer', initTimer], ['palette', initPalette],
      ['helix', initHelixReadout], ['scroll', initScroll], ['reveal', initReveal]
    ];
    steps.forEach(([name, run]) => {
      try { run(); } catch (err) { console.error('Start-up step "' + name + '" failed', err); }
    });
    window.addEventListener('hashchange', openForHash);
    openForHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.MP);
