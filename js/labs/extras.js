/* Supplementary labs: the Sanger chromatogram reader and the repeat ruler. */
(function (MP) {
  'use strict';
  const { el, svg } = MP;

  /* ================= chromatogram reader ================= */
  const SEQ = 'CTAGCTACAGTGAAATCTCGATGG'; // BRAF c.1789–1812
  const FIRST_POS = 1789;
  const VARIANT = 10;                     // c.1799: reference T, variant A
  const MODES = [
    { id: 'wt', label: 'Sample 1', alt: 0 },
    { id: 'het', label: 'Sample 2', alt: 0.5 },
    { id: 'low', label: 'Sample 3', alt: 0.12 }
  ];
  const FEEDBACK = {
    wt: { right: '<strong>Correct — no variant.</strong> Every position shows one clean peak. The low ripple along the baseline is noise.',
      wrong: '<strong>Look again.</strong> Every position has a single clean peak; this trace matches the reference. The ripple at the bottom is baseline noise.' },
    het: { right: '<strong>Correct.</strong> At c.1799 a T peak and an A peak overlap, each about half height: a heterozygous c.1799T&gt;A, p.(Val600Glu).',
      wrong: '<strong>Not there.</strong> Find the one position where two colours overlap at about half the usual height.',
      none: '<strong>There is one.</strong> Find the position where two colours overlap at about half the usual height.' },
    low: { right: '<strong>Well spotted — but would you sign it out?</strong> The A bump under the T peak is only about 12% of the signal, at or below Sanger’s limit of detection of 15–20%. No one should call it with confidence. This is the variant NGS exists for.',
      wrong: '<strong>Not there.</strong> The change is subtle: a small extra bump hiding under one tall peak.',
      none: '<strong>That is what most readers would say — and the variant would be missed.</strong> There is an A signal of about 12% under the T peak at c.1799, below Sanger’s limit of detection.' }
  };

  MP.registerLab('chroma', function (mount) {
    const frame = MP.labFrame(mount, {
      eyebrow: 'Try it · on your own',
      title: 'Read a Sanger chromatogram',
      hint: 'Three samples of the same stretch of BRAF. For each, tap the base where you see a variant — or say there is none.'
    });
    const W = 700, H = 210, PAD = 26, BASE = 150, TALL = 112;
    const gap = (W - PAD * 2) / (SEQ.length - 1);
    const sigma = gap * 0.3;
    const xAt = (i) => PAD + i * gap;
    let mode = MODES[0];
    let picked = null;
    const host = el('div', { class: 'chroma' });
    const key = el('div', { class: 'nt-key', 'aria-hidden': 'true' },
      ['A', 'C', 'G', 'T'].map((b) => el('span', null, el('i', { style: 'background:var(--nt-' + b.toLowerCase() + ')' }), b)));
    frame.body.append(host, key);

    function traces() {
      const rand = MP.rng(91);
      const heights = SEQ.split('').map(() => 0.78 + rand() * 0.22);
      const noise = ['A', 'C', 'G', 'T'].reduce((acc, b) => { acc[b] = SEQ.split('').map(() => rand() * 0.045); return acc; }, {});
      return ['A', 'C', 'G', 'T'].map((channel) => {
        const points = [];
        for (let px = 0; px <= W; px += 2) {
          let value = 0;
          for (let i = 0; i < SEQ.length; i++) {
            let amp = noise[channel][i];
            if (SEQ[i] === channel) amp += heights[i] * (i === VARIANT ? 1 - mode.alt : 1);
            if (i === VARIANT && channel === 'A') amp += heights[i] * mode.alt;
            const d = px - xAt(i);
            value += amp * Math.exp(-(d * d) / (2 * sigma * sigma));
          }
          points.push(px + ',' + (BASE - Math.min(1.05, value) * TALL).toFixed(1));
        }
        return svg('polyline', { class: 'tr tr-' + channel, points: points.join(' ') });
      });
    }

    function draw() {
      const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': 'Sanger sequencing trace with a called base under each peak' });
      root.append(svg('line', { class: 'bl', x1: 0, x2: W, y1: BASE, y2: BASE }), ...traces());
      SEQ.split('').forEach((base, i) => {
        const pos = FIRST_POS + i;
        const call = svg('g', { class: 'call' + (picked === i ? ' is-picked' : ''), tabindex: 0, role: 'button', data: { i: String(i) },
          'aria-pressed': String(picked === i), 'aria-label': 'Position c.' + pos + ', called ' + base },
          svg('rect', { x: xAt(i) - 11, y: BASE + 8, width: 22, height: 34, rx: 6 }),
          svg('text', { x: xAt(i), y: BASE + 26, text: base }),
          svg('line', { class: 'bar', x1: xAt(i) - 6, x2: xAt(i) + 6, y1: BASE + 34, y2: BASE + 34, style: 'stroke:var(--nt-' + base.toLowerCase() + ')' }));
        const choose = () => answer(i);
        call.addEventListener('click', choose);
        call.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); } });
        root.append(call);
        if (i % 5 === 0) root.append(svg('text', { class: 'pos', x: xAt(i), y: BASE + 56, text: 'c.' + pos }));
      });
      // The trace is redrawn on every pick; return keyboard focus to the base that was chosen.
      const active = document.activeElement;
      const focusIndex = active && host.contains(active) ? active.dataset.i : '';
      host.replaceChildren(root);
      const again = focusIndex ? root.querySelector('.call[data-i="' + focusIndex + '"]') : null;
      if (again) again.focus({ preventScroll: true });
    }

    function answer(choice) {
      picked = choice;
      draw();
      const text = FEEDBACK[mode.id];
      const hasVariant = mode.alt > 0;
      const right = hasVariant ? choice === VARIANT : choice === null;
      const message = right ? text.right : choice === null && text.none ? text.none : text.wrong;
      frame.readout.replaceChildren(el('p', { html: message }));
      if (right && mode.id === 'het') MP.store.markLab('chroma');
    }

    const modeCtl = MP.seg({ label: 'Sample', value: mode.id, options: MODES.map((m) => ({ id: m.id, label: m.label })),
      onChange: (id) => { mode = MODES.find((m) => m.id === id); picked = null; draw(); frame.readout.replaceChildren(el('p', { text: 'Tap the base with a variant, or choose “No variant”.' })); } });
    const none = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'No variant' });
    none.addEventListener('click', () => answer(null));
    frame.controls.append(modeCtl, none);
    draw();
    frame.readout.replaceChildren(el('p', { text: 'Tap the base with a variant, or choose “No variant”.' }));
  });

  /* ================= repeat ruler ================= */
  const GENES = [
    { id: 'fmr1', label: 'FMR1 · CGG (fragile X)', unit: 'CGG', min: 5, max: 260, start: 30,
      zones: [
        { to: 44, name: 'Normal', text: 'Stable when it is passed on.' },
        { to: 54, name: 'Intermediate', text: 'Not associated with disease; may lengthen slightly over generations.' },
        { to: 200, name: 'Premutation', text: 'The carrier does not have fragile X syndrome, but is at risk of early ovarian insufficiency and of a tremor–ataxia syndrome late in life — and the repeat can expand to a full mutation when a mother passes it on.' },
        { to: 260, name: 'Full mutation', text: 'More than 200 repeats: the expansion is methylated, the gene is silenced and its protein is not made. This is fragile X syndrome.' }
      ] },
    { id: 'htt', label: 'HTT · CAG (Huntington)', unit: 'CAG', min: 10, max: 60, start: 20,
      zones: [
        { to: 26, name: 'Normal', text: 'Stable; no disease.' },
        { to: 35, name: 'Intermediate', text: 'No disease in the carrier, but the repeat is unstable and can expand in a child, especially when inherited from the father.' },
        { to: 39, name: 'Reduced penetrance', text: 'Some carriers develop Huntington disease, often late in life; others never do.' },
        { to: 60, name: 'Full penetrance', text: 'Forty or more: Huntington disease will develop in a normal lifespan, and longer repeats mean earlier onset.' }
      ] }
  ];

  MP.registerLab('repeat', function (mount) {
    const frame = MP.labFrame(mount, {
      eyebrow: 'Try it · on your own',
      title: 'The repeat ruler',
      hint: 'Some diseases are caused by a three-letter motif repeated too many times. Slide the count and watch the category change.'
    });
    let gene = GENES[0];
    let count = gene.start;
    const track = el('div', { class: 'rr-track' });
    const pin = el('i');
    const units = el('div', { class: 'rr-units', 'aria-hidden': 'true' });
    frame.body.append(track, el('div', { class: 'rr-pin' }, pin), units);

    const zoneIndex = () => gene.zones.findIndex((z) => count <= z.to);
    function render() {
      const index = Math.max(0, zoneIndex());
      const zone = gene.zones[index];
      const from = index === 0 ? gene.min : gene.zones[index - 1].to + 1;
      const within = MP.clamp((count - from) / Math.max(1, zone.to - from), 0, 1);
      pin.style.left = ((index + within) / gene.zones.length) * 100 + '%';
      units.replaceChildren(...Array.from({ length: Math.min(count, 150) }, () => el('i')));
      frame.readout.replaceChildren(el('p', { html: '<strong>' + count + ' ' + gene.unit + ' repeats — ' + zone.name.toLowerCase() + '.</strong> ' + zone.text }));
    }
    function build() {
      track.replaceChildren(...gene.zones.map((zone, i) => el('div', { class: 'rr-zone', style: 'flex:1',
        text: zone.name + ' ' + (i === 0 ? '≤ ' + zone.to : i === gene.zones.length - 1 ? '> ' + gene.zones[i - 1].to : (gene.zones[i - 1].to + 1) + '–' + zone.to) })));
      slider.input.min = gene.min;
      slider.input.max = gene.max;
      slider.set(count);
      render();
    }
    const slider = MP.slider({ label: 'Number of repeats', min: gene.min, max: gene.max, step: 1, value: count, format: (v) => String(v),
      onInput: (v) => { count = v; render(); MP.store.markLab('repeat'); } });
    const geneCtl = MP.seg({ label: 'Gene', value: gene.id, options: GENES.map((g) => ({ id: g.id, label: g.label })),
      onChange: (id) => { gene = GENES.find((g) => g.id === id); count = gene.start; build(); } });
    frame.controls.append(geneCtl, slider);
    build();
  });
})(window.MP);
