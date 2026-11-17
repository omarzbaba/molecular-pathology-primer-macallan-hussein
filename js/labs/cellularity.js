/* Tumor cellularity estimator — a generated H&E-style field.
   The learner estimates the share of nuclei that are tumor, then sees the
   answer and what it means for the allele fraction. */
(function (MP) {
  'use strict';
  const { el, svg } = MP;

  const W = 640;
  const H = 330;
  const TARGETS = [10, 20, 30, 40, 50, 60, 70];
  const REQUIRED = 20; // illustrative minimum tumor content for a sequencing assay

  function makeField(seed) {
    const rand = MP.rng(seed);
    const target = TARGETS[Math.floor(rand() * TARGETS.length)];
    const total = 190 + Math.floor(rand() * 40);
    const wantTumor = Math.round((total * target) / 100);
    const cells = [];
    const clusters = Array.from({ length: 2 + Math.floor(rand() * 3) }, () => ({
      x: 80 + rand() * (W - 160), y: 70 + rand() * (H - 140), r: 55 + rand() * 60
    }));
    const isFree = (x, y, r) => cells.every((c) => (c.x - x) ** 2 + (c.y - y) ** 2 > ((c.r + r) * 0.86) ** 2);

    let tumor = 0;
    for (let tries = 0; tumor < wantTumor && tries < 9000; tries++) {
      const c = clusters[Math.floor(rand() * clusters.length)];
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * c.r * (1 + tries / 6000);
      const x = c.x + Math.cos(angle) * dist;
      const y = c.y + Math.sin(angle) * dist;
      const r = 6.4 + rand() * 3;
      if (x < 12 || x > W - 12 || y < 12 || y > H - 12 || !isFree(x, y, r)) continue;
      cells.push({ kind: 'tumor', x, y, r, rot: rand() * 180, squash: 0.72 + rand() * 0.22, tone: 0.78 + rand() * 0.22 });
      tumor++;
    }
    for (let tries = 0; cells.length < total && tries < 9000; tries++) {
      const fibro = rand() < 0.26;
      const x = 8 + rand() * (W - 16);
      const y = 8 + rand() * (H - 16);
      const r = fibro ? 5 : 3 + rand() * 0.8;
      if (!isFree(x, y, r)) continue;
      cells.push({ kind: fibro ? 'fibro' : 'lymph', x, y, r, rot: rand() * 180 });
    }
    return { cells, strands: Array.from({ length: 7 }, () => [rand() * H, (rand() - 0.5) * 90, rand() * H, 5 + rand() * 9]), pct: Math.round((tumor / cells.length) * 100) };
  }

  function drawField(field) {
    const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Simulated stained tissue: clusters of large tumor nuclei among small lymphocytes and elongated stromal cells' });
    field.strands.forEach((s) => root.append(svg('path', {
      d: 'M0 ' + s[0] + ' C ' + W * 0.33 + ' ' + (s[0] + s[1]) + ', ' + W * 0.66 + ' ' + (s[2] - s[1]) + ', ' + W + ' ' + s[2],
      style: 'fill:none;stroke:var(--he-stroma);stroke-width:' + s[3] + ';opacity:.5'
    })));
    const turn = (c) => 'rotate(' + c.rot.toFixed(0) + ' ' + c.x.toFixed(1) + ' ' + c.y.toFixed(1) + ')';
    field.cells.filter((c) => c.kind === 'tumor').forEach((c) => root.append(svg('ellipse', {
      cx: c.x.toFixed(1), cy: c.y.toFixed(1), rx: (c.r * 1.75).toFixed(1), ry: (c.r * 1.75 * c.squash).toFixed(1),
      transform: turn(c), style: 'fill:var(--he-cyto);opacity:.5'
    })));
    field.cells.forEach((c) => {
      if (c.kind === 'tumor') {
        const ry = (c.r * c.squash).toFixed(1);
        root.append(
          svg('ellipse', { cx: c.x.toFixed(1), cy: c.y.toFixed(1), rx: c.r.toFixed(1), ry, transform: turn(c), style: 'fill:var(--he-nuc);opacity:' + c.tone.toFixed(2) }),
          svg('circle', { cx: (c.x + 1.2).toFixed(1), cy: (c.y - 0.8).toFixed(1), r: 1.3, style: 'fill:#2a1650;opacity:.7' }),
          svg('ellipse', { class: 't-ring', cx: c.x.toFixed(1), cy: c.y.toFixed(1), rx: (c.r + 2.2).toFixed(1), ry: (c.r * c.squash + 2.2).toFixed(1), transform: turn(c) }));
      } else if (c.kind === 'fibro') {
        root.append(svg('ellipse', { cx: c.x.toFixed(1), cy: c.y.toFixed(1), rx: 6.8, ry: 2.1, transform: turn(c), style: 'fill:var(--he-fibro);opacity:.85' }));
      } else {
        root.append(svg('circle', { cx: c.x.toFixed(1), cy: c.y.toFixed(1), r: c.r.toFixed(1), style: 'fill:var(--he-lymph)' }));
      }
    });
    return root;
  }

  MP.registerLab('cellularity', function (mount) {
    const frame = MP.labFrame(mount, {
      title: 'Estimate the tumor cellularity',
      hint: 'What percentage of the nuclei belong to tumor? Count nuclei, not area. The large purple nuclei with pink cytoplasm are tumor.'
    });
    let seed = 11;
    let field = makeField(seed);
    let guess = 30;

    const host = el('div', { class: 'cell-field' });
    const key = el('div', { class: 'cell-key' },
      el('span', null, el('i', { style: 'width:13px;height:11px;background:var(--he-nuc)' }), 'tumor nucleus'),
      el('span', null, el('i', { style: 'width:7px;height:7px;background:var(--he-lymph)' }), 'lymphocyte'),
      el('span', null, el('i', { style: 'width:14px;height:5px;background:var(--he-fibro)' }), 'stromal cell'));
    frame.body.append(host, key);

    const slider = MP.slider({ label: 'Your estimate of tumor nuclei', min: 0, max: 100, step: 5, value: guess, format: (v) => v + '%', onInput: (v) => { guess = v; } });
    const check = el('button', { class: 'btn btn--primary btn--sm', type: 'button', text: 'Check my estimate' });
    const fresh = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'New field' });
    frame.controls.append(slider, el('div', { class: 'btn-row' }, check, fresh));

    function show() {
      host.classList.remove('show-tumor');
      host.replaceChildren(drawField(field));
      frame.readout.replaceChildren(el('p', { text: 'Move the slider to your estimate, then check it.' }));
    }
    check.addEventListener('click', () => {
      const actual = field.pct;
      const off = Math.abs(guess - actual);
      const verdict = off <= 5 ? 'Spot on.' : off <= 10 ? 'Close — within ten points, which is about as well as observers agree.' : 'Off by ' + off + ' points.';
      const habit = off <= 10 ? '' : guess > actual
        ? ' Over-calling is the usual error: large tumor nuclei catch the eye, while small lymphocytes are numerous and easy to ignore.'
        : ' You under-called it. Look again at how tightly the tumor nuclei are packed inside each cluster.';
      const enough = actual >= REQUIRED;
      host.classList.add('show-tumor');
      frame.readout.replaceChildren(
        el('p', { html: '<strong>' + actual + '% tumor nuclei.</strong> You estimated ' + guess + '%. ' + verdict + habit }),
        el('p', { html: 'A heterozygous mutation present in every tumor cell would appear at an allele fraction of about <strong>' + (actual / 2).toFixed(0) + '%</strong> — half the tumor fraction.' }),
        el('p', { html: '<span class="verdict-tag ' + (enough ? 'ok' : 'no') + '">' + (enough ? 'Adequate' : 'Too low') + '</span>' + (enough
          ? 'This clears an assay that needs ' + REQUIRED + '% tumor.'
          : 'An assay that needs ' + REQUIRED + '% tumor could miss a mutation here. Circle the densest area for macrodissection, or choose another block.') }));
      MP.store.markLab('cellularity');
    });
    fresh.addEventListener('click', () => { seed += 17; field = makeField(seed); show(); });
    show();
  });
})(window.MP);
