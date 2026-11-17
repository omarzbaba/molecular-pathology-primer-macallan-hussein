/* Which test can see it? — match a technology to the size and kind of lesion.
   Bars sit on a logarithmic ruler from one base to the whole genome. */
(function (MP) {
  'use strict';
  const { el } = MP;

  const LOG_MAX = 9.5; // log10 of about 3.2 billion bases
  const pct = (bases) => (Math.log10(bases) / LOG_MAX) * 100;

  const TECHS = [
    { id: 'kar', name: 'Karyotype', sub: 'whole genome, coarse', from: 5e6, to: 3.2e9 },
    { id: 'fish', name: 'FISH', sub: 'one chosen locus', from: 1e5, to: 2.5e8 },
    { id: 'arr', name: 'Microarray', sub: 'copy number only', from: 5e4, to: 3.2e9 },
    { id: 'pcr', name: 'PCR', sub: 'one chosen target', from: 1, to: 2e3 },
    { id: 'sang', name: 'Sanger', sub: 'one fragment', from: 1, to: 8e2 },
    { id: 'ngs', name: 'NGS', sub: 'many genes at once', from: 1, to: 60, softTo: 3.2e9 }
  ];

  // see: 2 = yes, 1 = depends on the design, 0 = no
  const LESIONS = [
    { id: 'snv', label: 'One base changed', eg: 'BRAF V600E', size: 1,
      see: { kar: 0, fish: 0, arr: 0, pcr: 2, sang: 2, ngs: 2 },
      best: '<strong>PCR or sequencing.</strong> A single base is far below what a microscope or an array can resolve. Use a targeted PCR for a known hotspot; use sequencing when the change could be anywhere in the gene.' },
    { id: 'indel', label: 'Three bases deleted', eg: 'CFTR F508del', size: 3,
      see: { kar: 0, fish: 0, arr: 0, pcr: 2, sang: 2, ngs: 2 },
      best: '<strong>PCR or sequencing</strong>, exactly as for a single base. Small insertions and deletions are sequence-level changes.' },
    { id: 'repeat', label: 'A repeat expansion', eg: 'FMR1, 200+ CGG repeats', size: 600,
      see: { kar: 0, fish: 0, arr: 0, pcr: 2, sang: 0, ngs: 1 },
      best: '<strong>PCR with fragment sizing</strong>, sometimes with Southern blotting. Short sequencing reads cannot span a long run of repeats, so a standard NGS panel is unreliable here.' },
    { id: 'amp', label: 'A gene amplified', eg: 'ERBB2 (HER2)', size: 3e5,
      see: { kar: 0, fish: 2, arr: 2, pcr: 1, sang: 0, ngs: 2 },
      best: '<strong>In situ hybridization</strong> counts the gene on the slide, cell by cell — the reflex after an equivocal HER2 immunostain. NGS can infer amplification from the depth of reads.' },
    { id: 'microdel', label: 'A 3-megabase deletion', eg: '22q11.2', size: 3e6,
      see: { kar: 0, fish: 2, arr: 2, pcr: 1, sang: 0, ngs: 1 },
      best: '<strong>Microarray</strong> when you do not know where to look; <strong>FISH</strong> when you suspect this exact region. It is too small for a karyotype.' },
    { id: 'trisomy', label: 'A whole extra chromosome', eg: 'Trisomy 21', size: 4.6e7,
      see: { kar: 2, fish: 2, arr: 2, pcr: 1, sang: 0, ngs: 1 },
      best: '<strong>Karyotype.</strong> It shows the extra chromosome and also reveals the translocation form, which matters for the family. FISH gives a rapid answer; a microarray detects it too.' },
    { id: 'balanced', label: 'A balanced translocation', eg: 't(9;22), BCR::ABL1', size: null,
      see: { kar: 2, fish: 2, arr: 0, pcr: 2, sang: 0, ngs: 1 },
      best: '<strong>Karyotype, FISH, or RT-PCR for the fusion transcript.</strong> Nothing is gained or lost, so a microarray reads it as normal. NGS finds a fusion only when the panel was designed to — usually from RNA.' },
    { id: 'methyl', label: 'A silenced promoter', eg: 'MLH1 methylation', size: null,
      see: { kar: 0, fish: 0, arr: 0, pcr: 0, sang: 0, ngs: 0 },
      best: '<strong>None of these, as ordinarily run.</strong> The sequence and the copy number are normal — the gene is switched off by methylation. It needs a methylation-specific assay.' }
  ];
  const VERDICT = [['is-no', 'No'], ['is-part', 'Depends'], ['is-yes', 'Yes']];

  MP.registerLab('whichtest', function (mount) {
    const frame = MP.labFrame(mount, {
      title: 'Which test can see it?',
      hint: 'Pick an alteration. Each bar shows the range of sizes a technology can detect; the blue line marks the size of the lesion you chose.'
    });

    const ruler = el('div', { class: 'wt-ruler' },
      // The two middle labels are dropped on narrow screens (their tick marks stay): see labs.css.
      [[1, '1 base', ''], [1e3, '1 thousand', 'wt-minor'], [1e6, '1 million', 'wt-minor'], [1e8, '100 million', '']]
        .map(([bases, label, cls]) => el('span', { class: cls || null, style: 'left:' + pct(bases) + '%', text: label })),
      el('i', { class: 'wt-pin' }));
    const rows = TECHS.map((tech) => {
      const bar = el('i', { style: 'left:' + pct(tech.from) + '%;width:' + (pct(tech.to) - pct(tech.from)) + '%' });
      const soft = tech.softTo ? el('i', { class: 'soft', style: 'left:' + pct(tech.to) + '%;width:' + (pct(tech.softTo) - pct(tech.to)) + '%' }) : null;
      const pin = el('b', { class: 'wt-pin' });
      const verdict = el('span', { class: 'wt-verdict' });
      const row = el('div', { class: 'wt-row' },
        el('span', { class: 'wt-name' }, tech.name, el('small', { text: tech.sub })),
        el('div', { class: 'wt-track' }, bar, soft, pin), verdict);
      return { tech, row, pin, verdict };
    });
    frame.body.append(ruler, el('div', { class: 'wt-rows' }, rows.map((r) => r.row)));

    const chips = LESIONS.map((lesion) => {
      const chip = el('button', { class: 'chip', type: 'button', text: lesion.label });
      chip.addEventListener('click', () => { choose(lesion); MP.store.markLab('whichtest'); });
      return chip;
    });
    frame.controls.append(el('div', { class: 'chips', role: 'group', 'aria-label': 'Choose an alteration' }, chips));

    function choose(lesion) {
      chips.forEach((chip, i) => chip.setAttribute('aria-pressed', String(LESIONS[i] === lesion)));
      const left = lesion.size ? pct(lesion.size) + '%' : null;
      [ruler.querySelector('.wt-pin')].concat(rows.map((r) => r.pin)).forEach((pin) => {
        pin.style.opacity = left ? '1' : '0';
        if (left) pin.style.left = left;
      });
      rows.forEach((r) => {
        const level = VERDICT[lesion.see[r.tech.id]];
        r.row.className = 'wt-row ' + level[0];
        r.verdict.textContent = level[1];
      });
      frame.readout.replaceChildren(
        el('p', { html: '<strong>' + lesion.label + '</strong> — for example, ' + lesion.eg + (lesion.size ? '' : '. Its size is beside the point: what matters is the kind of change') + '.' }),
        el('p', { html: lesion.best }));
    }
    choose(LESIONS[0]);
  });
})(window.MP);
