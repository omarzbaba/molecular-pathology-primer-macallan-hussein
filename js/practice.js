/* Practice: questions (checkpoints + bank), cases, learner switcher, progress. */
(function (MP) {
  'use strict';
  const { el, $, $$ } = MP;

  const KEYS = ['A', 'B', 'C', 'D', 'E'];
  const SHORT = ['Language', 'Specimen', 'Amplify', 'Sequence', 'Chromosomes', 'Interpret', 'Cancer', 'Beyond'];
  const BANK_PAGE = 5;      // questions shown per step, so the bank never arrives as one long wall
  let bankFilter = 0;       // 0 = all objectives
  let bankShown = BANK_PAGE;

  /* ---------- one question ---------- */
  const FNV_OFFSET = 2166136261;
  const FNV_PRIME = 16777619;
  const ORDER_SALT = 2823; // chosen so the keyed answers spread evenly over A–D across the whole set

  /** A fixed display order for a question's options, so the keyed answer is never
      predictable from its position. Saved answers keep the authored index. */
  function displayOrder(question) {
    let seed = FNV_OFFSET ^ ORDER_SALT;
    for (let i = 0; i < question.id.length; i++) seed = Math.imul(seed ^ question.id.charCodeAt(i), FNV_PRIME);
    const rand = MP.rng(seed);
    const order = question.opts.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  function buildQuestion(question) {
    const card = el('article', { class: 'q', data: { qid: question.id, obj: question.obj } });
    const opts = el('div', { class: 'q-opts' });
    const explain = el('div', { class: 'q-explain', hidden: true });
    const order = displayOrder(question); // order[slot] = authored index shown in that slot

    function paint(choice) {
      card.dataset.done = '1';
      Array.from(opts.children).forEach((button, slot) => {
        const authored = order[slot];
        button.disabled = true;
        if (authored === question.answer) {
          button.classList.add('is-correct');
          button.append(el('span', { class: 'opt-mark', text: '✓' }));
        } else if (authored === choice) {
          button.classList.add('is-wrong');
          button.append(el('span', { class: 'opt-mark', text: '✗' }));
        } else {
          button.classList.add('is-dim');
        }
      });
      const ok = choice === question.answer;
      explain.replaceChildren(
        el('p', { class: 'verdict ' + (ok ? 'ok' : 'no'), text: ok ? '✓ Correct' : '✗ Not quite' }),
        el('p', { html: '<strong>' + KEYS[order.indexOf(question.answer)] + ' is correct.</strong> ' + question.explain }),
        el('p', { class: 'why-wrong', html: question.wrong }),
        el('p', { class: 'note note--pearl' }, el('span', { class: 'note-label', text: 'Pearl' }), el('span', { html: question.pearl })));
      explain.hidden = false;
    }

    order.forEach((authored, slot) => {
      const button = el('button', { class: 'opt', type: 'button' },
        el('span', { class: 'opt-key', text: KEYS[slot] }), el('span', { html: question.opts[authored] }));
      button.addEventListener('click', () => {
        if (card.dataset.done) return;
        paint(authored);
        MP.store.answer(question.id, authored);
      });
      opts.append(button);
    });

    card.append(
      el('div', { class: 'q-meta' }, MP.levelTag(question.level),
        el('span', { class: 'q-tag', text: 'Objective ' + question.obj + ' · ' + SHORT[question.obj - 1] })),
      el('p', { class: 'q-stem', html: question.stem }), opts, explain);

    const saved = MP.store.answers()[question.id];
    if (Number.isInteger(saved)) paint(saved);
    return card;
  }

  function renderCheckpoints() {
    $$('[data-checkpoint]').forEach((host) => {
      const question = MP.data.questions.find((q) => q.cp === host.dataset.checkpoint);
      host.replaceChildren(question ? buildQuestion(question) : el('p', { class: 'empty', text: 'No checkpoint for this stop yet.' }));
    });
  }

  function renderBank(focusFrom) {
    const host = $('#bankList');
    if (!host) return;
    const items = MP.data.questions.filter((q) => !q.cp && (bankFilter === 0 || q.obj === bankFilter));
    if (!items.length) {
      host.replaceChildren(el('p', { class: 'empty', text: 'No questions for this objective yet.' }));
      return;
    }
    const visible = items.slice(0, bankShown);
    const left = items.length - visible.length;
    const more = left > 0
      ? el('button', { class: 'btn btn--ghost bank-more', type: 'button', text: 'Show ' + Math.min(BANK_PAGE, left) + ' more · ' + left + ' left' })
      : null;
    if (more) {
      more.addEventListener('click', () => {
        const firstNew = bankShown;
        bankShown += BANK_PAGE;
        renderBank(firstNew);
      });
    }
    host.replaceChildren(...visible.map(buildQuestion), ...(more ? [more] : []));
    // After "show more", keep keyboard focus moving forward into the first new question.
    if (Number.isInteger(focusFrom) && host.children[focusFrom]) {
      const target = host.children[focusFrom].querySelector('button:not([disabled])');
      if (target) target.focus({ preventScroll: true });
    }
  }

  function renderBankFilters() {
    const host = $('#bankFilters');
    if (!host) return;
    const labels = ['All'].concat(SHORT.map((name, i) => (i + 1) + ' · ' + name));
    const chips = labels.map((label, i) => {
      const chip = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(i === bankFilter), text: label });
      chip.addEventListener('click', () => {
        bankFilter = i;
        bankShown = BANK_PAGE;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        renderBank();
      });
      return chip;
    });
    host.replaceChildren(...chips);
  }

  /* ---------- cases ---------- */
  function buildCase(item) {
    const head = el('div', { class: 'case-head' },
      el('span', { class: 'q-tag', text: item.tag }), el('h4', { text: item.title }), el('p', { html: item.blurb }),
      item.facts ? el('div', { class: 'labs-strip' }, item.facts.map((fact) => el('span', { class: 'labv' }, fact[0] + ' ', el('b', { text: fact[1] })))) : null);

    const steps = item.steps.map((step, i) => {
      const reveal = el('div', { class: 'step-reveal', 'aria-hidden': 'true' }, el('div', null, el('div', { class: 'inner', html: step.answer })));
      const button = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-expanded': 'false', text: 'Show the reasoning' });
      button.addEventListener('click', () => {
        const open = reveal.classList.toggle('show');
        reveal.setAttribute('aria-hidden', String(!open));
        button.setAttribute('aria-expanded', String(open));
        button.textContent = open ? 'Hide the reasoning' : 'Show the reasoning';
      });
      return el('div', { class: 'case-step' },
        el('div', { class: 'step-label', text: 'Decision ' + (i + 1) + ' of ' + item.steps.length }),
        el('p', { class: 'step-prompt', html: step.ask }),
        el('div', { class: 'step-actions' }, button), reveal);
    });
    return el('article', { class: 'case' }, head, el('div', { class: 'case-body' }, steps));
  }

  function renderCases() {
    $$('[data-cases]').forEach((host) => {
      host.replaceChildren(...MP.data.cases.filter((c) => c.slot === host.dataset.cases).map(buildCase));
    });
  }

  /* ---------- who is studying ---------- */
  function renderWho() {
    const host = $('#who');
    if (!host) return;
    const current = MP.store.learner();
    // Built once, then updated in place, so the button being pressed keeps keyboard focus.
    if (!host.children.length) {
      host.replaceChildren(...MP.store.learners.map((name) => {
        const button = el('button', { class: 'who-btn', type: 'button', data: { who: name }, title: 'Keep ' + name + '’s progress on this device' },
          el('span', { class: 'who-av', text: name.charAt(0) }), el('span', { text: name }));
        button.addEventListener('click', () => MP.store.setLearner(name === MP.store.learner() ? '' : name));
        return button;
      }));
    }
    Array.from(host.children).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.who === current)));
  }

  /* ---------- progress: header ring, score, nav ticks, objective rings ---------- */
  const RING_C = 97.4; // circumference for r = 15.5
  MP.updateProgress = function () {
    const answers = MP.store.answers();
    const all = MP.data.questions;
    const done = all.filter((q) => Number.isInteger(answers[q.id]));
    const correct = done.filter((q) => answers[q.id] === q.answer);
    const frac = all.length ? done.length / all.length : 0;
    const who = MP.store.learner();

    const ring = $('#ring');
    if (ring) ring.style.strokeDashoffset = (RING_C * (1 - frac)).toFixed(1);
    const pct = $('#progPct');
    if (pct) pct.textContent = Math.round(frac * 100) + '%';
    const label = $('#progLabel');
    if (label) label.textContent = (who ? who + ' · ' : '') + done.length + ' of ' + all.length + ' answered';
    const ok = $('#scoreOk');
    if (ok) ok.textContent = String(correct.length);
    const total = $('#scoreDone');
    if (total) total.textContent = String(done.length);

    $$('.nav-tick').forEach((tick) => {
      const question = all.find((q) => q.cp === tick.dataset.tick);
      const choice = question ? answers[question.id] : undefined;
      tick.classList.toggle('is-done', question !== undefined && choice === question.answer);
      tick.classList.toggle('is-part', Number.isInteger(choice) && choice !== question.answer);
      tick.style.setProperty('--p', '50%');
    });
    MP.updateObjectives();
  };

  MP.renderPractice = function () {
    renderWho();
    renderCheckpoints();
    renderBankFilters();
    renderBank();
    renderCases();

    const reset = $('#resetBtn');
    if (reset) {
      reset.addEventListener('click', () => {
        const who = MP.store.learner() || 'this device';
        if (window.confirm('Clear all answers saved for ' + who + '?')) MP.store.reset();
      });
    }
    MP.on('progress', MP.updateProgress);
    MP.on('reset', () => { renderCheckpoints(); renderBank(); });
    MP.on('learner', () => { renderWho(); renderCheckpoints(); renderBank(); });
    MP.updateProgress();
  };
})(window.MP);
