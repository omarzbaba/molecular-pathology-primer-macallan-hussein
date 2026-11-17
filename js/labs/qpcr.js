/* Real-time PCR explorer — how the starting amount of target sets the Ct.
   One highlighted curve against a grey ten-fold dilution series. */
(function (MP) {
  'use strict';
  const { el, svg } = MP;

  const W = 660, H = 320, L = 54, R = 22, T = 40, B = 42;
  const CYCLES = 40;
  const THRESHOLD = 0.1;       // fraction of the plateau
  const STEEPNESS = 1.6;
  const CT_AT_ONE_COPY = 38;
  const PER_LOG = 3.3219;      // cycles per ten-fold at perfect efficiency
  const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷'];

  const ctFor = (logCopies) => CT_AT_ONE_COPY - PER_LOG * logCopies;
  const midpoint = (ct) => ct - STEEPNESS * Math.log(THRESHOLD / (1 - THRESHOLD));
  const signal = (cycle, ct) => 1 / (1 + Math.exp(-(cycle - midpoint(ct)) / STEEPNESS));
  const x = (cycle) => L + (cycle / CYCLES) * (W - L - R);
  const y = (frac) => T + (1 - frac) * (H - T - B);
  const curve = (ct) => {
    const points = [];
    for (let c = 0; c <= CYCLES; c += 0.5) points.push(x(c).toFixed(1) + ',' + y(signal(c, ct)).toFixed(1));
    return points.join(' ');
  };

  MP.registerLab('qpcr', function (mount) {
    const frame = MP.labFrame(mount, {
      title: 'Real-time PCR: read the Ct',
      hint: 'Slide the starting amount. The more target at the start, the earlier the curve crosses the threshold.'
    });
    let logCopies = 4;
    let blank = false;

    const chart = svg('svg', { class: 'chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    [0, 0.25, 0.5, 0.75, 1].forEach((f) => chart.append(svg('line', { class: 'grid', x1: L, x2: W - R, y1: y(f), y2: y(f) })));
    [0, 10, 20, 30, 40].forEach((c) => chart.append(svg('text', { x: x(c), y: H - 20, 'text-anchor': 'middle', text: String(c) })));
    chart.append(
      svg('text', { x: W - R, y: H - 4, 'text-anchor': 'end', text: 'PCR cycle' }),
      svg('text', { x: L - 10, y: y(1) + 4, 'text-anchor': 'end', text: 'max' }),
      svg('text', { x: L - 10, y: y(0) + 4, 'text-anchor': 'end', text: '0' }),
      svg('text', { x: L, y: 14, text: 'starting copies' }),
      svg('line', { class: 'axis', x1: L, x2: W - R, y1: y(0), y2: y(0) }));
    for (let log = 1; log <= 7; log++) {
      const ct = ctFor(log);
      chart.append(svg('polyline', { class: 'ghost', points: curve(ct) }),
        svg('text', { x: x(ct), y: 28, 'text-anchor': 'middle', text: '10' + SUP[log] }));
    }
    chart.append(svg('line', { class: 'ref', x1: L, x2: W - R, y1: y(THRESHOLD), y2: y(THRESHOLD) }),
      svg('text', { class: 'lbl', x: L + 6, y: y(THRESHOLD) - 7, text: 'threshold' }));
    const drop = svg('line', { class: 'cross', x1: 0, x2: 0, y1: y(THRESHOLD), y2: y(0) });
    const line = svg('polyline', { class: 'series' });
    const dot = svg('circle', { class: 'dot', r: 5, cy: y(THRESHOLD) });
    const ctLabel = svg('text', { class: 'lbl', y: y(THRESHOLD) - 12, 'text-anchor': 'middle' });
    const hair = svg('line', { class: 'cross', y1: T, y2: y(0), visibility: 'hidden' });
    chart.append(drop, line, dot, ctLabel, hair);

    const tip = el('div', { class: 'tip', hidden: true });
    const wrap = el('div', { class: 'chart-wrap' }, chart, tip);
    const table = el('details', { class: 'tbl-view' }, el('summary', { text: 'View as a table' }),
      el('table', null, el('tr', null, el('th', { text: 'Starting copies' }), el('th', { text: 'Ct' })),
        [1, 2, 3, 4, 5, 6, 7].map((log) => el('tr', null, el('td', { text: MP.fmt(Math.pow(10, log)) }), el('td', { text: ctFor(log).toFixed(1) })))));
    frame.body.append(wrap, table);

    function render() {
      const ct = ctFor(logCopies);
      const copies = Math.round(Math.pow(10, logCopies));
      [drop, dot, ctLabel].forEach((node) => node.setAttribute('visibility', blank ? 'hidden' : 'visible'));
      if (blank) {
        line.setAttribute('points', x(0) + ',' + y(0.004) + ' ' + x(CYCLES) + ',' + y(0.012));
        chart.setAttribute('aria-label', 'Amplification plot: a flat line that never reaches the threshold');
        frame.readout.replaceChildren(el('p', { html: '<strong>No amplification — Ct undetermined.</strong> That is what a no-template control should look like. In a patient sample it means “not detected”, provided the internal control amplified; if that failed too, the result is invalid, not negative.' }));
        return;
      }
      line.setAttribute('points', curve(ct));
      drop.setAttribute('x1', x(ct)); drop.setAttribute('x2', x(ct));
      dot.setAttribute('cx', x(ct));
      ctLabel.setAttribute('x', x(ct)); ctLabel.textContent = 'Ct ' + ct.toFixed(1);
      chart.setAttribute('aria-label', 'Amplification plot: with about ' + MP.fmt(copies) + ' starting copies the curve crosses the threshold at cycle ' + ct.toFixed(1));
      frame.readout.replaceChildren(el('p', { html: '<strong>Ct ' + ct.toFixed(1) + '</strong> with about ' + MP.fmt(copies) + ' starting copies. Ten times more target would cross about 3.3 cycles earlier; half as much, one cycle later. <strong>Low Ct, lots of target.</strong>' }));
    }

    chart.addEventListener('pointermove', (event) => {
      const box = chart.getBoundingClientRect();
      const cycle = MP.clamp(Math.round((((event.clientX - box.left) / box.width) * W - L) / (W - L - R) * CYCLES), 0, CYCLES);
      const value = blank ? 0.004 : signal(cycle, ctFor(logCopies));
      hair.setAttribute('x1', x(cycle)); hair.setAttribute('x2', x(cycle)); hair.setAttribute('visibility', 'visible');
      tip.replaceChildren(el('b', { text: 'Cycle ' + cycle }), ' · signal ' + Math.round(value * 100) + '% of maximum');
      tip.style.left = ((x(cycle) / W) * box.width) + 'px';
      tip.style.top = ((y(value) / H) * box.height - 10) + 'px';
      tip.hidden = false;
    });
    chart.addEventListener('pointerleave', () => { tip.hidden = true; hair.setAttribute('visibility', 'hidden'); });

    const slider = MP.slider({ label: 'Starting copies of the target', min: 0, max: 7, step: 0.1, value: logCopies,
      format: (v) => '≈ ' + MP.fmt(Math.round(Math.pow(10, v))),
      onInput: (v) => { logCopies = v; blank = false; toggle.setAttribute('aria-pressed', 'false'); render(); MP.store.markLab('qpcr'); } });
    const toggle = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: 'No-template control' });
    toggle.addEventListener('click', () => { blank = !blank; toggle.setAttribute('aria-pressed', String(blank)); render(); });
    frame.controls.append(slider, toggle);
    render();
  });
})(window.MP);
