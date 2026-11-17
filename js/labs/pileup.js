/* Read pileup — depth, tumor purity and variant allele fraction.
   Reads are sampled at random, so resampling shows why low-level
   variants are sometimes missed. */
(function (MP) {
  'use strict';
  const { el, svg } = MP;

  const REF = 'GGTCTAGCTACAGTGAAATCTCGATGGAGTGGG';
  const VARIANT_INDEX = 13; // c.1799, reference T, variant A
  const DEPTHS = [20, 50, 100, 250, 500, 1000, 2000];
  const MAX_ROWS = 28;
  const LOD_VAF = 5;   // illustrative reporting threshold, percent
  const LOD_READS = 5; // and minimum supporting reads
  const CELL = 20, X0 = 20, ROW = 12, TOP = 44;

  const ORIGINS = [
    { id: 'somatic', label: 'Somatic, in every tumor cell' },
    { id: 'subclone', label: 'Somatic, in a subclone' },
    { id: 'germline', label: 'Germline' }
  ];
  const expectedVaf = (origin, purity) => (origin === 'germline' ? 50 : origin === 'subclone' ? purity / 8 : purity / 2);

  MP.registerLab('pileup', function (mount) {
    const frame = MP.labFrame(mount, {
      title: 'The read pileup',
      hint: 'Each grey bar is one sequencing read laid against the reference. Change the tumor purity and the depth, then resample.'
    });
    let origin = 'somatic';
    let purity = 40;
    let depthIndex = 4;
    let seed = 3;
    let sample = { alt: 0, depth: 0 };

    const host = el('div', { class: 'pile' });
    const nums = el('div', { class: 'vaf-nums' });
    const fill = el('span', { class: 'vaf-fill' });
    const meter = el('div', { class: 'vaf' }, nums,
      el('div', { class: 'vaf-track', role: 'img' }, fill, el('span', { class: 'vaf-lod', style: 'left:' + LOD_VAF + '%' })),
      el('div', { class: 'vaf-scale' }, el('span', { text: '0%' }),
        el('span', { class: 'vaf-lod-label', text: 'limit of detection ' + LOD_VAF + '%', style: 'left:' + (LOD_VAF + 1.5) + '%' }),
        el('span', { class: 'vaf-mid', text: '50%' }), el('span', { text: '100%' })));
    frame.body.append(host, meter);

    function draw() {
      const rand = MP.rng(seed);
      const depth = DEPTHS[depthIndex];
      const expected = expectedVaf(origin, purity);
      let alt = 0;
      for (let i = 0; i < depth; i++) if (rand() * 100 < expected) alt++;
      sample = { alt, depth };

      const rows = Math.min(depth, MAX_ROWS);
      const altRows = alt === 0 ? 0 : Math.max(1, Math.round((rows * alt) / depth));
      const flags = Array.from({ length: rows }, (_, i) => i < altRows);
      for (let i = flags.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = flags[i]; flags[i] = flags[j]; flags[j] = t; }

      const height = TOP + rows * ROW + 26;
      const root = svg('svg', { viewBox: '0 0 700 ' + height, role: 'img',
        'aria-label': 'Pileup of ' + rows + ' sample reads; ' + altRows + ' carry the variant base A at position c.1799' });
      root.append(svg('rect', { class: 'col', x: X0 + VARIANT_INDEX * CELL, y: 6, width: CELL, height: height - 30, rx: 5 }),
        svg('text', { class: 'ref-n', x: X0 + VARIANT_INDEX * CELL + CELL / 2, y: 16, text: 'c.1799' }));
      REF.split('').forEach((base, i) => root.append(svg('text', { x: X0 + i * CELL + CELL / 2, y: 34, text: base })));
      flags.forEach((isAlt, row) => {
        const length = 14 + Math.floor(rand() * 11);
        const start = Math.max(0, Math.min(REF.length - length, VARIANT_INDEX - Math.floor(rand() * length)));
        const yy = TOP + row * ROW;
        root.append(svg('rect', { class: 'read', x: X0 + start * CELL + 1, y: yy, width: length * CELL - 2, height: ROW - 3, rx: 3.5 }));
        if (isAlt) {
          root.append(svg('rect', { class: 'alt-cell', x: X0 + VARIANT_INDEX * CELL + 2, y: yy - 1, width: CELL - 4, height: ROW - 1, rx: 3 }),
            svg('text', { class: 'alt-t', x: X0 + VARIANT_INDEX * CELL + CELL / 2, y: yy + 8.2, text: 'A' }));
        }
      });
      root.append(svg('text', { class: 'cap', x: X0, y: height - 6, text: depth > rows ? 'Showing ' + rows + ' of ' + MP.fmt(depth) + ' reads' : 'All ' + depth + ' reads shown' }));
      host.replaceChildren(root);

      const observed = depth ? (alt / depth) * 100 : 0;
      fill.style.width = Math.min(100, observed) + '%';
      meter.querySelector('.vaf-track').setAttribute('aria-label', 'Observed allele fraction ' + observed.toFixed(1) + ' percent');
      nums.replaceChildren(
        el('div', null, el('span', { text: 'Expected VAF' }), el('b', { text: expected.toFixed(1) + '%' })),
        el('div', null, el('span', { text: 'Observed' }), el('b', { text: alt + ' / ' + MP.fmt(depth) + ' = ' + observed.toFixed(1) + '%' })),
        el('div', null, el('span', { text: 'Depth' }), el('b', { text: MP.fmt(depth) + '×' })));

      const detected = alt >= LOD_READS && observed >= LOD_VAF;
      const tag = detected ? ['ok', 'Reported'] : alt > 0 ? ['mid', 'Below the threshold'] : ['no', 'Not seen'];
      const verdict = detected
        ? 'Enough variant reads, above the ' + LOD_VAF + '% limit of detection.'
        : alt > 0 ? 'Only ' + alt + ' variant read' + (alt === 1 ? '' : 's') + ' at ' + observed.toFixed(1) + '%. This assay needs ' + LOD_READS + ' reads and ' + LOD_VAF + '% — it would be reported as not detected.'
          : 'No variant reads were sampled. The variant is there; this run simply did not catch it.';
      const lesson = origin === 'germline'
        ? 'A germline heterozygous variant is in every cell, tumor or not, so it sits near <strong>50% whatever the purity</strong>. In tumor-only sequencing, that number is the clue.'
        : origin === 'subclone'
          ? 'A subclone is present in only a share of the tumor cells, so its allele fraction is far below half the purity. <strong>Depth is what makes it visible.</strong>'
          : 'A heterozygous mutation in every tumor cell appears at <strong>half the tumor purity</strong>. Lower the purity and it slides toward the limit of detection.';
      frame.readout.replaceChildren(
        el('p', { html: '<span class="verdict-tag ' + tag[0] + '">' + tag[1] + '</span>' + verdict }),
        el('p', { html: lesson }));
    }

    const originCtl = MP.seg({ label: 'Where is the variant?', value: origin, options: ORIGINS, onChange: (id) => { origin = id; draw(); MP.store.markLab('pileup'); } });
    const purityCtl = MP.slider({ label: 'Tumor purity', min: 10, max: 100, step: 5, value: purity, format: (v) => v + '%', onInput: (v) => { purity = v; draw(); MP.store.markLab('pileup'); } });
    const depthCtl = MP.slider({ label: 'Sequencing depth', min: 0, max: DEPTHS.length - 1, step: 1, value: depthIndex, format: (v) => MP.fmt(DEPTHS[v]) + '×', onInput: (v) => { depthIndex = v; draw(); MP.store.markLab('pileup'); } });
    const again = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Resample' });
    again.addEventListener('click', () => { seed += 1; draw(); });
    frame.controls.append(originCtl, purityCtl, depthCtl, again);
    draw();
  });
})(window.MP);
