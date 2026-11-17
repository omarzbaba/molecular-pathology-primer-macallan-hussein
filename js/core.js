/* Molecular Pathology Primer — core: namespace, DOM helpers, event bus,
   per-learner progress store, and the shared lab frame and controls. */
(function () {
  'use strict';

  const MP = (window.MP = window.MP || {});
  MP.data = MP.data || {};
  MP.labs = {};

  const SVG_NS = 'http://www.w3.org/2000/svg';
  // Every primer published under omarzbaba.github.io shares one browser origin, so each group of learners
  // needs its own progress key; otherwise two primers would overwrite each other's saved answers.
  const STORE_KEY = 'mpp.v1.macallan-hussein';
  const THEME_KEY = 'mpp.theme';
  const LEARNERS = Object.freeze(['Macallan', 'Hussein']);
  const COHORT = '_cohort';

  /* ---------- DOM helpers ---------- */
  MP.$ = (sel, root) => (root || document).querySelector(sel);
  MP.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function applyAttrs(node, attrs) {
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === 'class') node.setAttribute('class', value);
      else if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value; // author-written strings only
      else if (key === 'data') Object.assign(node.dataset, value);
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : String(value));
    });
  }
  function appendKids(node, kids) {
    kids.flat(Infinity).forEach((kid) => {
      if (kid == null || kid === false) return;
      node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
  }
  MP.el = function (tag, attrs, ...kids) {
    const node = document.createElement(tag);
    applyAttrs(node, attrs);
    appendKids(node, kids);
    return node;
  };
  MP.svg = function (tag, attrs, ...kids) {
    const node = document.createElementNS(SVG_NS, tag);
    applyAttrs(node, attrs);
    appendKids(node, kids);
    return node;
  };

  /* ---------- small utilities ---------- */
  MP.clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  MP.fmt = (n) => Number(n).toLocaleString('en-US');
  MP.reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Seeded pseudo-random generator (mulberry32) so drawings are reproducible. */
  MP.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* ---------- event bus ---------- */
  const listeners = {};
  MP.on = function (event, fn) {
    listeners[event] = (listeners[event] || []).concat(fn);
  };
  MP.emit = function (event, detail) {
    (listeners[event] || []).forEach((fn) => {
      try { fn(detail); } catch (err) { console.error('Listener for "' + event + '" failed', err); }
    });
  };

  /* ---------- theme ---------- */
  MP.theme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  MP.setTheme = function (theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* storage unavailable: theme lasts for this visit */ }
    MP.emit('theme', next);
  };

  /* ---------- per-learner progress (validated on read; memory fallback) ---------- */
  const emptySlot = () => ({ answers: {}, labs: {} });
  let state = { learner: '', slots: {} };

  function sanitizeSlot(raw) {
    const slot = emptySlot();
    if (!raw || typeof raw !== 'object') return slot;
    Object.entries(raw.answers || {}).forEach(([id, choice]) => {
      if (Number.isInteger(choice) && choice >= 0 && choice < 8) slot.answers[id] = choice;
    });
    Object.entries(raw.labs || {}).forEach(([id, done]) => { if (done === true) slot.labs[id] = true; });
    return slot;
  }
  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return;
      const slots = {};
      Object.entries(raw.slots || {}).forEach(([key, value]) => {
        if (key === COHORT || LEARNERS.includes(key)) slots[key] = sanitizeSlot(value);
      });
      state = { learner: LEARNERS.includes(raw.learner) ? raw.learner : '', slots };
    } catch (err) {
      console.warn('Saved progress could not be read; starting fresh.', err);
    }
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (err) { /* private mode: progress lasts for this visit */ }
  }
  const slotKey = () => state.learner || COHORT;
  const currentSlot = () => state.slots[slotKey()] || emptySlot();
  function writeSlot(next) {
    state = { learner: state.learner, slots: Object.assign({}, state.slots, { [slotKey()]: next }) };
    saveState();
    MP.emit('progress');
  }

  MP.store = {
    learners: LEARNERS,
    learner: () => state.learner,
    setLearner(name) {
      state = { learner: LEARNERS.includes(name) ? name : '', slots: state.slots };
      saveState();
      MP.emit('learner', state.learner);
      MP.emit('progress');
    },
    answers: () => currentSlot().answers,
    answer(id, choice) {
      const slot = currentSlot();
      writeSlot({ answers: Object.assign({}, slot.answers, { [id]: choice }), labs: slot.labs });
    },
    labsDone: () => currentSlot().labs,
    markLab(id) {
      const slot = currentSlot();
      if (slot.labs[id]) return;
      writeSlot({ answers: slot.answers, labs: Object.assign({}, slot.labs, { [id]: true }) });
    },
    reset() {
      writeSlot(emptySlot());
      MP.emit('reset');
    }
  };
  loadState();

  // Another tab changed the saved progress: adopt it, so this tab never writes stale answers back.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORE_KEY) return;
    loadState();
    MP.emit('learner', state.learner);
    MP.emit('progress');
  });

  /* ---------- lab frame and controls ---------- */
  let uid = 0;

  /** Builds the standard lab shell inside `mount` and returns its regions. */
  MP.labFrame = function (mount, opts) {
    const body = MP.el('div', { class: 'lab-body' });
    const controls = MP.el('div', { class: 'lab-controls' });
    const readout = MP.el('div', { class: 'lab-readout', 'aria-live': 'polite' });
    const head = MP.el('div', { class: 'lab-head' },
      MP.el('span', { class: 'lab-eyebrow', text: opts.eyebrow || 'Try it' }),
      MP.el('h4', { text: opts.title }),
      opts.hint ? MP.el('p', { text: opts.hint }) : null);
    const root = MP.el('div', { class: 'lab' + (opts.stage ? ' stage' : '') }, head, body, controls, readout);
    mount.replaceChildren(root);
    return { root, body, controls, readout };
  };

  /** Labelled range slider. opts: {label, min, max, step, value, format, onInput} */
  MP.slider = function (opts) {
    const id = 'mp-range-' + (++uid);
    const format = opts.format || String;
    const out = MP.el('b', { text: format(opts.value) });
    const input = MP.el('input', {
      class: 'range', type: 'range', id, min: opts.min, max: opts.max, step: opts.step, value: opts.value,
      'aria-valuetext': format(opts.value)
    });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      out.textContent = format(v);
      input.setAttribute('aria-valuetext', format(v));
      opts.onInput(v);
    });
    const wrap = MP.el('div', { class: 'ctl' },
      MP.el('label', { class: 'ctl-label', for: id }, MP.el('span', { text: opts.label }), out), input);
    wrap.set = (v) => {
      input.value = v;
      out.textContent = format(Number(v));
      input.setAttribute('aria-valuetext', format(Number(v)));
    };
    wrap.input = input;
    return wrap;
  };

  /** Segmented single-choice control, built as a true radio group: one Tab stop,
      arrow keys move the choice. opts: {label, options:[{id,label}], value, onChange} */
  MP.seg = function (opts) {
    const group = MP.el('div', { class: 'seg', role: 'radiogroup', 'aria-label': opts.label });
    const ids = opts.options.map((option) => option.id);
    const buttons = opts.options.map((option) => MP.el('button', { type: 'button', role: 'radio', text: option.label }));
    const STEP = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

    function setValue(id) {
      const known = ids.includes(id);
      buttons.forEach((button, i) => {
        const on = ids[i] === id;
        button.setAttribute('aria-checked', String(on));
        button.tabIndex = (known ? on : i === 0) ? 0 : -1;
      });
    }
    function pick(index, moveFocus) {
      const wrapped = (index + ids.length) % ids.length;
      setValue(ids[wrapped]);
      if (moveFocus) buttons[wrapped].focus();
      opts.onChange(ids[wrapped]);
    }
    function targetFor(key, from) {
      if (STEP[key]) return from + STEP[key];
      if (key === 'Home') return 0;
      if (key === 'End') return ids.length - 1;
      return null;
    }
    buttons.forEach((button, i) => {
      button.addEventListener('click', () => pick(i, false));
      button.addEventListener('keydown', (event) => {
        const target = targetFor(event.key, i);
        if (target === null) return;
        event.preventDefault();
        pick(target, true);
      });
    });
    setValue(opts.value);
    group.append(...buttons);
    const wrap = MP.el('div', { class: 'ctl-group' }, MP.el('span', { text: opts.label }), group);
    wrap.set = setValue;
    return wrap;
  };

  MP.registerLab = function (name, init) { MP.labs[name] = init; };

  /** Marks the labs the selected learner has already worked through. */
  function paintTried() {
    const done = MP.store.labsDone();
    MP.$$('[data-lab]').forEach((mount) => mount.classList.toggle('is-tried', done[mount.dataset.lab] === true));
  }

  /** Mounts every [data-lab]; one failing lab never takes the page down. */
  MP.mountLabs = function () {
    MP.$$('[data-lab]').forEach((mount) => {
      const init = MP.labs[mount.dataset.lab];
      if (!init) return;
      try {
        init(mount);
      } catch (err) {
        console.error('Lab "' + mount.dataset.lab + '" failed to start', err);
        mount.replaceChildren(MP.el('div', { class: 'lab' },
          MP.el('p', { class: 'lab-error', text: 'This interactive could not start in your browser. The rest of the page works without it.' })));
      }
    });
    paintTried();
    MP.on('progress', paintTried);
  };
})();
