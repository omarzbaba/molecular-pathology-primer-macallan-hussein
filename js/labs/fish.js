/* FISH simulator — four probe designs, their normal and abnormal patterns,
   and a short "call the nucleus" exercise. Signals are described in words
   as well as colour, and can be lettered, so colour is never the only cue. */
(function (MP) {
  'use strict';
  const { el, svg } = MP;

  const DESIGNS = [
    { id: 'breakapart', label: 'Break-apart', eg: 'ALK',
      how: 'Two colours sit on either side of one gene. They stay together unless that gene is broken by a rearrangement.',
      normal: ['F', 'F'], abnormal: ['F', 'R', 'G'],
      nText: 'Two fused signals: both copies of the gene are intact.',
      aText: 'One fused signal, plus a red and a green that have moved apart: one copy is rearranged.' },
    { id: 'fusion', label: 'Dual fusion', eg: 'BCR::ABL1',
      how: 'Each colour marks a different gene. Fused signals appear only when a translocation brings the two genes together.',
      normal: ['R', 'R', 'G', 'G'], abnormal: ['R', 'G', 'F', 'F'],
      nText: 'Two red and two green, all separate.',
      aText: 'One red, one green and two fusions — one on each rearranged chromosome.' },
    { id: 'amp', label: 'Amplification', eg: 'ERBB2 (HER2)',
      how: 'Red marks the gene; green marks the centromere of the same chromosome. A ratio of two or more reds per green, with an average of at least four reds per nucleus, means amplification.',
      normal: ['R', 'R', 'G', 'G'], abnormal: ['G', 'G'].concat(Array(16).fill('r')),
      nText: 'Two gene signals for two centromere signals.',
      aText: 'A crowd of red signals for two green: the gene is amplified.' },
    { id: 'del', label: 'Deletion', eg: 'TP53 at 17p',
      how: 'Red marks the gene of interest; green is a control elsewhere on the same chromosome.',
      normal: ['R', 'R', 'G', 'G'], abnormal: ['R', 'G', 'G'],
      nText: 'Two gene signals and two control signals.',
      aText: 'One red for two green: one copy of the gene has been lost.' }
  ];
  const NAMES = { F: 'fusion', R: 'red', G: 'green', r: 'red' };
  let serial = 0;

  function describe(pattern) {
    const tally = { fusion: 0, red: 0, green: 0 };
    pattern.forEach((code) => { tally[NAMES[code]] += 1; });
    return ['fusion', 'red', 'green'].filter((k) => tally[k]).map((k) => tally[k] + ' ' + k).join(', ');
  }

  /** Places signals at random inside the nucleus, keeping them apart. */
  function layout(pattern, rand) {
    const placed = [];
    const clusters = [[78 + rand() * 20, 82 + rand() * 20], [108 + rand() * 20, 104 + rand() * 20]];
    pattern.forEach((code, i) => {
      const small = code === 'r';
      for (let tries = 0; tries < 200; tries++) {
        const centre = small ? clusters[i % 2] : [100, 100];
        const reach = small ? 22 : 62;
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * reach;
        const x = centre[0] + Math.cos(angle) * dist;
        const y = centre[1] + Math.sin(angle) * dist;
        const gap = small ? 7 : 30;
        if (Math.hypot(x - 100, y - 100) > 70) continue;
        if (placed.every((p) => Math.hypot(p.x - x, p.y - y) > (p.small && small ? 7 : gap))) { placed.push({ code, x, y, small }); return; }
      }
    });
    return placed;
  }

  function nucleus(pattern, seed) {
    const id = 'fish' + (++serial);
    const root = svg('svg', { viewBox: '0 0 200 200', role: 'img', 'aria-label': 'Nucleus showing ' + describe(pattern) + ' signals' });
    const grad = svg('radialGradient', { id: id + 'g', cx: '42%', cy: '38%', r: '70%' },
      svg('stop', { offset: '0%', 'stop-color': '#3d5fd9' }), svg('stop', { offset: '100%', 'stop-color': '#16205a' }));
    const glow = svg('filter', { id: id + 'f', x: '-80%', y: '-80%', width: '260%', height: '260%' }, svg('feGaussianBlur', { stdDeviation: 2.6 }));
    root.append(svg('defs', null, grad, glow),
      svg('path', { d: 'M100 14 C150 12 190 52 186 104 C183 152 146 188 98 186 C50 184 12 148 14 98 C16 50 52 16 100 14 Z', fill: 'url(#' + id + 'g)', opacity: 0.92 }));
    const dot = (x, y, r, colour) => [
      svg('circle', { cx: x, cy: y, r: r * 1.9, fill: colour, opacity: 0.55, filter: 'url(#' + id + 'f)' }),
      svg('circle', { cx: x, cy: y, r, fill: colour })
    ];
    layout(pattern, MP.rng(seed)).forEach((s) => {
      const x = Number(s.x.toFixed(1));
      const y = Number(s.y.toFixed(1));
      if (s.code === 'F') {
        root.append(...dot(x - 3.6, y, 5.6, 'var(--fl-red)'), ...dot(x + 3.6, y, 5.6, 'var(--fl-green)'), svg('circle', { cx: x, cy: y, r: 4.4, fill: 'var(--fl-gold)' }));
      } else {
        root.append(...dot(x, y, s.small ? 3.4 : 5.8, s.code === 'G' ? 'var(--fl-green)' : 'var(--fl-red)'));
      }
      if (!s.small) root.append(svg('text', { class: 'fish-lbl', x: x + 10, y: y - 8, text: s.code }));
    });
    return root;
  }

  MP.registerLab('fish', function (mount) {
    const frame = MP.labFrame(mount, {
      stage: true,
      title: 'FISH simulator',
      hint: 'Choose a probe design, learn its normal and abnormal pattern, then call five nuclei.'
    });
    let design = DESIGNS[0];
    let seed = 40;
    let streak = 0;
    let truth = false;

    const pair = el('div', { class: 'fish-pair' });
    const quizNucleus = el('div');
    const quizText = el('p');
    const streakOut = el('div', { class: 'fish-streak' });
    const callNormal = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Normal' });
    const callAbnormal = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Abnormal' });
    const quiz = el('div', { class: 'fish-q' }, quizNucleus,
      el('div', null, el('h5', { text: 'Call this nucleus' }), quizText, el('div', { class: 'btn-row' }, callNormal, callAbnormal), streakOut));
    const root = el('div', { class: 'fish' }, pair, quiz);
    frame.body.append(root);

    function figure(pattern, title, text) {
      return el('figure', { class: 'fish-cell' }, nucleus(pattern, ++seed),
        el('figcaption', null, el('b', { text: title + ' · ' + describe(pattern) }), text));
    }
    function nextCell(message) {
      truth = MP.rng(++seed)() < 0.5;
      quizNucleus.replaceChildren(nucleus(truth ? design.abnormal : design.normal, seed * 7));
      quizText.innerHTML = message || 'Is the pattern normal or abnormal for a <strong>' + design.label.toLowerCase() + '</strong> probe?';
      streakOut.textContent = streak >= 5 ? 'Five in a row.' : streak + ' of 5 in a row';
    }
    function answer(saidAbnormal) {
      const right = saidAbnormal === truth;
      streak = right ? streak + 1 : 0;
      const pattern = describe(truth ? design.abnormal : design.normal);
      if (streak >= 5) {
        MP.store.markLab('fish');
        nextCell('<strong>You have the pattern.</strong> In practice the laboratory scores 50 to 200 nuclei and applies a validated cut-off, because sectioning through nuclei and chance overlap create false patterns in a few cells.');
        return;
      }
      nextCell((right ? '<strong>Correct</strong>' : '<strong>Not quite</strong>') + ' — that one showed ' + pattern + ', which is ' + (truth ? 'abnormal' : 'normal') + '. Try the next.');
    }
    callNormal.addEventListener('click', () => answer(false));
    callAbnormal.addEventListener('click', () => answer(true));

    function show() {
      pair.replaceChildren(figure(design.normal, 'Normal', design.nText), figure(design.abnormal, 'Abnormal', design.aText));
      frame.readout.replaceChildren(el('p', { html: '<strong>' + design.label + ' probe — ' + design.eg + '.</strong> ' + design.how }));
      streak = 0;
      nextCell();
    }

    const designCtl = MP.seg({ label: 'Probe design', value: design.id, options: DESIGNS.map((d) => ({ id: d.id, label: d.label })),
      onChange: (id) => { design = DESIGNS.find((d) => d.id === id); show(); } });
    const letters = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: 'Letter the signals' });
    letters.addEventListener('click', () => {
      const on = root.classList.toggle('show-lbl');
      letters.setAttribute('aria-pressed', String(on));
    });
    frame.controls.append(designCtl, letters);
    show();
  });
})(window.MP);
