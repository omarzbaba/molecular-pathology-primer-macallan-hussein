/* Mismatch-repair board — four immunostains. Toggle a protein to "lost"
   and read the pattern and the next step. */
(function (MP) {
  'use strict';
  const { el, svg } = MP;

  const PROTEINS = ['MLH1', 'PMS2', 'MSH2', 'MSH6'];
  const PRESETS = [
    { label: 'All intact', lost: [] },
    { label: 'MLH1 + PMS2 lost', lost: ['MLH1', 'PMS2'] },
    { label: 'MSH2 + MSH6 lost', lost: ['MSH2', 'MSH6'] },
    { label: 'PMS2 alone', lost: ['PMS2'] },
    { label: 'MSH6 alone', lost: ['MSH6'] }
  ];

  /** Reads a staining pattern. Proteins work as pairs: MLH1–PMS2 and MSH2–MSH6. */
  function interpret(lost) {
    const key = PROTEINS.filter((p) => lost.has(p)).join('+');
    switch (key) {
      case '':
        return ['ok', 'Mismatch repair intact', 'All four proteins are present, so the tumor is very likely microsatellite stable.', 'No further mismatch-repair testing is routinely needed. A strong personal or family history still deserves a genetics referral: a small share of Lynch tumors keep all four stains, and intact stains say nothing about other inherited syndromes.'];
      case 'MLH1+PMS2':
        return ['no', 'MLH1 and PMS2 lost — the commonest abnormal pattern', 'PMS2 needs its partner MLH1 to be stable, so when MLH1 fails both disappear. Most of these tumors are <strong>sporadic</strong>: the <i>MLH1</i> promoter has been silenced by methylation.', 'Test for <strong><i>MLH1</i> promoter methylation</strong> — in colorectal cancer a <strong><i>BRAF</i> V600E</strong> mutation points the same way. If neither is found, refer for germline testing for Lynch syndrome.'];
      case 'MSH2+MSH6':
        return ['no', 'MSH2 and MSH6 lost', 'MSH6 needs its partner MSH2, so both are lost when MSH2 fails. There is no methylation shortcut for this pattern, and Lynch syndrome is the leading explanation.', 'Refer for <strong>genetic counseling and germline testing</strong> of <i>MSH2</i> (and <i>EPCAM</i>, whose deletion silences <i>MSH2</i>).'];
      case 'PMS2':
        return ['no', 'PMS2 lost alone', 'MLH1 is still present, so the fault usually lies in PMS2 itself.', 'Refer for <strong>genetic counseling and germline testing</strong> of <i>PMS2</i> — and of <i>MLH1</i>, which explains a minority of these tumors.'];
      case 'MSH6':
        return ['no', 'MSH6 lost alone', 'MSH2 is still present, so the fault lies in MSH6 itself.', 'Refer for <strong>genetic counseling and germline testing</strong> of <i>MSH6</i>.'];
      default:
        return ['mid', 'An unusual pattern', 'This combination does not fit the way the proteins pair. A technical problem is more likely than new biology.', 'Check the <strong>internal control</strong> — non-tumor nuclei must stain — then repeat the stains, and consider testing for microsatellite instability by PCR.'];
    }
  }

  function tile(name, seed) {
    const rand = MP.rng(seed);
    const art = svg('svg', { viewBox: '0 0 120 84', 'aria-hidden': 'true' });
    for (let i = 0; i < 24; i++) {
      const x = 10 + (i % 6) * 20 + (rand() - 0.5) * 9;
      const y = 12 + Math.floor(i / 6) * 20 + (rand() - 0.5) * 8;
      art.append(svg('ellipse', { class: 'nuc', cx: x.toFixed(1), cy: y.toFixed(1), rx: (5.6 + rand() * 2).toFixed(1), ry: (4.6 + rand() * 1.6).toFixed(1), transform: 'rotate(' + Math.round(rand() * 180) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' }));
    }
    for (let i = 0; i < 7; i++) art.append(svg('circle', { cx: (6 + rand() * 108).toFixed(1), cy: (6 + rand() * 72).toFixed(1), r: 2.5, style: 'fill:#4a2a10' }));
    const status = el('span', { text: 'retained' });
    const button = el('button', { class: 'mmr-tile', type: 'button', 'aria-pressed': 'false' }, art, el('div', null, el('b', { text: name }), status));
    return { name, button, status, art };
  }

  MP.registerLab('mmr', function (mount) {
    const frame = MP.labFrame(mount, {
      title: 'The mismatch-repair board',
      hint: 'Four immunostains on one tumor. Brown nuclei have kept the protein; blue nuclei have lost it. The small dark cells are lymphocytes — they always stain, which proves the stain worked. Tap a tile to lose a protein.'
    });
    let lost = new Set();
    const tiles = PROTEINS.map((name, i) => tile(name, 21 + i * 13));
    frame.body.append(el('div', { class: 'mmr-tiles' }, tiles.map((t) => t.button)));

    const chips = PRESETS.map((preset) => {
      const chip = el('button', { class: 'chip', type: 'button', text: preset.label });
      chip.addEventListener('click', () => { lost = new Set(preset.lost); render(); MP.store.markLab('mmr'); });
      return chip;
    });
    frame.controls.append(el('div', { class: 'chips', role: 'group', 'aria-label': 'Example patterns' }, chips));

    function render() {
      tiles.forEach((t) => {
        const gone = lost.has(t.name);
        t.button.setAttribute('aria-pressed', String(gone));
        t.button.setAttribute('aria-label', t.name + ': ' + (gone ? 'lost' : 'retained') + '. Tap to change.');
        t.status.textContent = gone ? 'lost' : 'retained';
        t.art.querySelectorAll('.nuc').forEach((n) => { n.style.fill = gone ? 'var(--dab-blue)' : 'var(--dab)'; });
      });
      chips.forEach((chip, i) => chip.setAttribute('aria-pressed', String(PRESETS[i].lost.length === lost.size && PRESETS[i].lost.every((p) => lost.has(p)))));
      const result = interpret(lost);
      frame.readout.replaceChildren(
        el('p', { html: '<span class="verdict-tag ' + result[0] + '">' + (result[0] === 'ok' ? 'Proficient' : result[0] === 'no' ? 'Deficient' : 'Look closer') + '</span><strong>' + result[1] + '.</strong> ' + result[2] }),
        el('p', { html: '<strong>Next:</strong> ' + result[3] }));
    }
    tiles.forEach((t) => t.button.addEventListener('click', () => {
      const next = new Set(lost);
      if (next.has(t.name)) next.delete(t.name); else next.add(t.name);
      lost = next;
      render();
      MP.store.markLab('mmr');
    }));
    render();
  });
})(window.MP);
