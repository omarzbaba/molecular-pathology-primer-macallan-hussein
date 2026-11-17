/* PCR cycler — three temperatures, three jobs, and the doubling that follows.
   The first three cycles play in detail; the rest fast-forward to thirty. */
(function (MP) {
  'use strict';
  const { el, svg } = MP;

  const MAX_CYCLES = 30;
  const DETAILED = 3;
  const DURATION = { start: 600, denature: 1300, anneal: 1300, extend: 1900, done: 900 }; // ms at 1×
  const NEXT = { start: 'denature', denature: 'anneal', anneal: 'extend', extend: 'done' };
  const CAPTION = {
    start: '<strong>One double-stranded template.</strong> The target lies between two primer sites.',
    denature: '<strong>95 °C · Denature.</strong> Heat breaks the hydrogen bonds and the two strands separate.',
    anneal: '<strong>About 60 °C · Anneal.</strong> Short primers find their complementary sequence and bind. Primer design gives PCR its specificity.',
    extend: '<strong>72 °C · Extend.</strong> A heat-stable polymerase builds a new strand from each primer, 5′ to 3′.',
    done: '<strong>Cycle complete.</strong> Each template has become two.'
  };

  function buildScene() {
    const scene = svg('svg', { class: 'pcr-scene', viewBox: '0 0 460 240', role: 'img', 'aria-label': 'Animated PCR: the template separates, primers bind, and new strands are built' });
    const bonds = svg('g');
    for (let x = 52; x <= 408; x += 15) bonds.append(svg('line', { class: 'bond', x1: x, x2: x, y1: 114, y2: 126 }));
    const top = svg('g', { class: 'gt' },
      svg('line', { class: 'tpl', x1: 40, x2: 420, y1: 110, y2: 110 }),
      svg('text', { class: 'end', x: 18, y: 114, text: '5′' }), svg('text', { class: 'end', x: 428, y: 114, text: '3′' }),
      svg('line', { class: 'primer', x1: 330, x2: 420, y1: 123, y2: 123 }),
      svg('path', { class: 'ext', d: 'M330 123 L40 123', pathLength: 1 }));
    const bottom = svg('g', { class: 'gb' },
      svg('line', { class: 'tpl', x1: 40, x2: 420, y1: 130, y2: 130 }),
      svg('text', { class: 'end', x: 18, y: 134, text: '3′' }), svg('text', { class: 'end', x: 428, y: 134, text: '5′' }),
      svg('line', { class: 'primer', x1: 40, x2: 130, y1: 117, y2: 117 }),
      svg('path', { class: 'ext', d: 'M130 117 L420 117', pathLength: 1 }));
    scene.append(bonds, top, bottom);
    return scene;
  }

  function buildChart() {
    const W = 250, H = 220, L = 40, R = 12, T = 16, B = 30;
    const x = (cycle) => L + (cycle / MAX_CYCLES) * (W - L - R);
    const y = (copies) => T + (1 - Math.log10(copies) / 9.2) * (H - T - B);
    const chart = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Copies of the target against cycle number, on a logarithmic scale' });
    [[1, '1'], [1e3, '10³'], [1e6, '10⁶'], [1e9, '10⁹']].forEach(([value, label]) => {
      chart.append(svg('line', { class: 'grid', x1: L, x2: W - R, y1: y(value), y2: y(value) }),
        svg('text', { x: L - 7, y: y(value) + 3.5, 'text-anchor': 'end', text: label }));
    });
    [0, 10, 20, 30].forEach((cycle) => chart.append(svg('text', { x: x(cycle), y: H - 12, 'text-anchor': 'middle', text: String(cycle) })));
    chart.append(svg('text', { x: W - R, y: H - 1, 'text-anchor': 'end', text: 'cycle' }),
      svg('line', { class: 'axis', x1: L, x2: W - R, y1: H - B, y2: H - B }));
    const line = svg('polyline', { class: 'series', points: '' });
    const dot = svg('circle', { class: 'dot', r: 4.5, cx: x(0), cy: y(1) });
    const note = svg('text', { class: 'lbl', x: L + 4, y: T + 2, text: '' });
    chart.append(line, dot, note);

    let shown = 0;
    const describe = (cycle) => 'cycle ' + cycle + ' · ' + MP.fmt(Math.pow(2, cycle)) + (cycle === 0 ? ' copy' : ' copies');
    function update(cycle) {
      shown = cycle;
      const points = [];
      for (let c = 0; c <= cycle; c++) points.push(x(c).toFixed(1) + ',' + y(Math.pow(2, c)).toFixed(1));
      line.setAttribute('points', points.join(' '));
      dot.setAttribute('cx', x(cycle));
      dot.setAttribute('cy', y(Math.pow(2, cycle)));
      note.textContent = '';
    }
    chart.addEventListener('pointermove', (event) => {
      const box = chart.getBoundingClientRect();
      const vx = ((event.clientX - box.left) / box.width) * W;
      const cycle = MP.clamp(Math.round(((vx - L) / (W - L - R)) * MAX_CYCLES), 0, shown);
      dot.setAttribute('cx', x(cycle));
      dot.setAttribute('cy', y(Math.pow(2, cycle)));
      note.textContent = describe(cycle);
    });
    chart.addEventListener('pointerleave', () => update(shown));
    return { node: el('div', { class: 'pcr-chart' }, chart), update };
  }

  MP.registerLab('pcr', function (mount) {
    const frame = MP.labFrame(mount, {
      stage: true,
      title: 'The PCR cycler',
      hint: 'Press play. Three temperatures do three jobs, and every cycle doubles the target. Hover over the chart to read any cycle.'
    });
    const temps = { denature: ['95°', 'Denature'], anneal: ['60°', 'Anneal'], extend: ['72°', 'Extend'] };
    const tempEls = {};
    const tempRow = el('div', { class: 'pcr-temps' }, Object.keys(temps).map((key) => {
      tempEls[key] = el('span', { class: 'temp' }, el('b', { text: temps[key][0] }), temps[key][1]);
      return tempEls[key];
    }));
    const cycleOut = el('b', { text: '0' });
    const copiesOut = el('b', { text: '1' });
    const counts = el('div', { class: 'pcr-count' },
      el('div', null, el('span', { text: 'Cycle' }), cycleOut), el('div', null, el('span', { text: 'Copies' }), copiesOut));
    const chart = buildChart();
    const root = el('div', { class: 'pcr', data: { phase: 'start' } },
      el('div', { class: 'pcr-top' }, tempRow, counts),
      el('div', { class: 'pcr-main' }, buildScene(), chart.node));
    frame.body.append(root);

    let cycle = 0;
    let phase = 'start';
    let playing = false;
    let speed = 1;
    let timer = 0;

    const rate = () => (cycle >= DETAILED ? 6 : 1) * speed;
    function setPhase(next, snap) {
      phase = next;
      if (snap) root.classList.add('is-snap');
      root.style.setProperty('--k', String(rate()));
      root.dataset.phase = next;
      if (snap) { void root.offsetWidth; root.classList.remove('is-snap'); }
      Object.keys(tempEls).forEach((key) => tempEls[key].classList.toggle('is-on', key === next));
      cycleOut.textContent = String(cycle);
      copiesOut.textContent = MP.fmt(Math.pow(2, cycle));
      chart.update(cycle);
      const extra = next === 'done' && cycle === MAX_CYCLES ? ' Thirty cycles: about a billion copies from a single molecule.'
        : next !== 'start' && cycle >= DETAILED && cycle < MAX_CYCLES ? ' Now fast-forwarding to cycle thirty.' : '';
      frame.readout.replaceChildren(el('p', { html: CAPTION[next] + extra }));
    }
    function advance() {
      if (phase === 'done') {
        if (cycle >= MAX_CYCLES) { setPlaying(false); return; }
        setPhase('start', true);
      } else {
        if (phase === 'extend') cycle += 1;
        setPhase(NEXT[phase], false);
      }
      if (cycle >= 5) MP.store.markLab('pcr');
      queue();
    }
    function queue() {
      window.clearTimeout(timer);
      if (playing) timer = window.setTimeout(advance, DURATION[phase] / rate());
    }
    function setPlaying(next) {
      playing = next;
      play.textContent = playing ? 'Pause' : cycle >= MAX_CYCLES ? 'Done' : 'Play';
      play.disabled = !playing && cycle >= MAX_CYCLES;
      queue();
    }

    const play = el('button', { class: 'btn btn--primary btn--sm', type: 'button', text: 'Play' });
    const step = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Step' });
    const reset = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Reset' });
    play.addEventListener('click', () => setPlaying(!playing));
    step.addEventListener('click', () => { setPlaying(false); if (cycle < MAX_CYCLES || phase !== 'done') { advance(); window.clearTimeout(timer); } });
    reset.addEventListener('click', () => { window.clearTimeout(timer); playing = false; cycle = 0; setPhase('start', true); play.disabled = false; play.textContent = 'Play'; });
    const speedCtl = MP.seg({ label: 'Speed', value: 1, options: [{ id: 1, label: '1×' }, { id: 2, label: '2×' }, { id: 4, label: '4×' }],
      onChange: (value) => { speed = value; root.style.setProperty('--k', String(rate())); queue(); } });
    frame.controls.append(el('div', { class: 'btn-row' }, play, step, reset), speedCtl);
    setPhase('start', true);
  });
})(window.MP);
