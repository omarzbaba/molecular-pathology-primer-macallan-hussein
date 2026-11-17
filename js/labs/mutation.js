/* Mutation lab — the real BRAF coding sequence around codon 600.
   Change one base (or apply a preset) and the consequence and its
   standard name are worked out live. */
(function (MP) {
  'use strict';
  const { el } = MP;

  const REF = 'GGTCTAGCTACAGTGAAATCTCGATGGAGTGGG'; // BRAF codons 596–606
  const FIRST_CODON = 596;
  const FIRST_POS = 1786; // c. position of the first base shown
  const AA3 = { A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp', C: 'Cys', Q: 'Gln', E: 'Glu', G: 'Gly', H: 'His', I: 'Ile', L: 'Leu', K: 'Lys', M: 'Met', F: 'Phe', P: 'Pro', S: 'Ser', T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val', '*': 'Ter' };

  const CODE = (function () {
    const bases = 'TCAG';
    const acids = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
    const map = {};
    let i = 0;
    for (const a of bases) for (const b of bases) for (const c of bases) map[a + b + c] = acids[i++];
    return map;
  })();
  const translate = (seq) => {
    const out = [];
    for (let i = 0; i + 3 <= seq.length; i += 3) out.push(CODE[seq.slice(i, i + 3)]);
    return out;
  };
  const REF_AA = translate(REF);
  const baseAt = (pos) => REF[pos - FIRST_POS];
  const codonOf = (pos) => Math.floor((pos - FIRST_POS) / 3);

  const PRESETS = [
    { id: 'ref', label: 'Reference', state: { kind: 'ref' } },
    { id: 'missense', label: 'Missense', state: { kind: 'sub', pos: 1799, alt: 'A' } },
    { id: 'silent', label: 'Silent', state: { kind: 'sub', pos: 1800, alt: 'A' } },
    { id: 'nonsense', label: 'Nonsense', state: { kind: 'sub', pos: 1801, alt: 'T' } },
    { id: 'frameshift', label: 'Frameshift', state: { kind: 'del', from: 1799, to: 1799 } },
    { id: 'inframe', label: 'In-frame deletion', state: { kind: 'del', from: 1798, to: 1800 } }
  ];

  const TEXT = {
    ref: '<strong>Reference sequence.</strong> These are codons 596 to 606 of <i>BRAF</i>. Tap any base to change it, or choose a preset.',
    Missense: '<strong>Missense.</strong> One amino acid is swapped for another. Whether that matters depends on where it sits and what it does to the protein.',
    Silent: '<strong>Silent (synonymous).</strong> The codon changed but still spells the same amino acid, because the genetic code is redundant. Usually harmless.',
    Nonsense: '<strong>Nonsense.</strong> The codon has become a stop signal. Translation halts here and the protein is cut short — typically a loss of function.',
    Frameshift: '<strong>Frameshift.</strong> Removing one base shifts the reading frame: every codon downstream is misread, and a premature stop usually follows. Typically a loss of function.',
    'In-frame deletion': '<strong>In-frame deletion.</strong> Three bases — one whole codon — are gone. The reading frame is kept and the protein is one amino acid shorter. <i>CFTR</i> F508del, the commonest cystic fibrosis variant, is this kind of change.'
  };
  const V600E = ' <strong>This is <i>BRAF</i> V600E</strong> — the best-known variant in oncology. It locks the kinase on, and it is found in melanoma, papillary thyroid carcinoma, colorectal carcinoma and hairy cell leukemia.';

  /** Works out the mutated sequence, the display codons and the names for a state. */
  function derive(state) {
    if (state.kind === 'sub') {
      const i = state.pos - FIRST_POS;
      const seq = REF.slice(0, i) + state.alt + REF.slice(i + 1);
      const ci = codonOf(state.pos);
      const from = REF_AA[ci];
      const to = translate(seq)[ci];
      const n = FIRST_CODON + ci;
      const cls = to === from ? 'Silent' : to === '*' ? 'Nonsense' : 'Missense';
      const protein = cls === 'Silent' ? 'p.(' + AA3[from] + n + '=)' : 'p.(' + AA3[from] + n + AA3[to] + ')';
      const short = cls === 'Missense' ? from + n + to : '';
      return { seq, cls, cdna: 'c.' + state.pos + baseAt(state.pos) + '>' + state.alt, protein, short, changedIndex: i, hitCodon: ci, stopCodon: to === '*' ? ci : -1 };
    }
    if (state.kind === 'del') {
      const a = state.from - FIRST_POS;
      const b = state.to - FIRST_POS;
      const seq = REF.slice(0, a) + REF.slice(b + 1);
      const ci = codonOf(state.from);
      const n = FIRST_CODON + ci;
      const inFrame = (b - a + 1) % 3 === 0;
      const cdna = 'c.' + (a === b ? state.from : state.from + '_' + state.to) + 'del';
      if (inFrame) return { seq, cls: 'In-frame deletion', cdna, protein: 'p.(' + AA3[REF_AA[ci]] + n + 'del)', short: '', deletedCodon: ci, hitCodon: -1, stopCodon: -1 };
      const shifted = translate(seq);
      // Protein name in the short HGVS form: the first changed residue, then "fs".
      return { seq, cls: 'Frameshift', cdna, protein: 'p.(' + AA3[REF_AA[ci]] + n + 'fs)', short: '', shiftFrom: ci, hitCodon: -1, stopCodon: shifted.indexOf('*', ci) };
    }
    return { seq: REF, cls: 'ref', cdna: '', protein: '', short: '', hitCodon: -1, stopCodon: -1 };
  }

  MP.registerLab('mutation', function (mount) {
    const frame = MP.labFrame(mount, {
      title: 'Mutation lab',
      hint: 'This is the real BRAF sequence around codon 600. Tap a base to change it, or try a preset — and watch the name write itself.'
    });
    let state = { kind: 'ref' };
    const row = el('div', { class: 'mut-seq' });
    frame.body.append(
      el('div', { class: 'mut-cap' }, el('span', { text: 'BRAF · coding strand, 5′ → 3′ · codons 596–606' }), el('span', { text: 'amino acid under each codon' })),
      row);

    const chips = PRESETS.map((preset) => {
      const chip = el('button', { class: 'chip', type: 'button', text: preset.label });
      chip.addEventListener('click', () => { state = preset.state; render(); MP.store.markLab('mutation'); });
      return chip;
    });
    frame.controls.append(el('div', { class: 'chips', role: 'group', 'aria-label': 'Preset variants' }, chips));

    function tapBase(pos) {
      const others = 'ACGT'.replace(baseAt(pos), '');
      if (state.kind === 'sub' && state.pos === pos) {
        const next = others.indexOf(state.alt) + 1;
        state = next < others.length ? { kind: 'sub', pos, alt: others[next] } : { kind: 'ref' };
      } else {
        state = { kind: 'sub', pos, alt: others[0] };
      }
      MP.store.markLab('mutation');
      render();
    }

    function codonEl(number, bases, acid, flags) {
      const label = acid ? [AA3[acid], el('small', { text: acid === '*' ? 'stop' : acid })] : ['…'];
      return el('div', { class: 'codon ' + flags },
        el('span', { class: 'codon-n', text: String(number) }),
        el('span', { class: 'codon-b' }, bases),
        el('span', { class: 'codon-aa' }, label));
    }
    function baseButton(letter, pos, changed, locked) {
      const button = el('button', {
        class: 'base' + (changed ? ' is-changed' : ''), type: 'button', data: pos ? { b: letter, pos: String(pos) } : { b: letter }, text: letter,
        'aria-label': 'Base ' + letter + (pos ? ' at c.' + pos : '') + (changed ? ', changed' : ''), disabled: locked
      });
      if (!locked && pos) button.addEventListener('click', () => tapBase(pos));
      return button;
    }

    function render() {
      const d = derive(state);
      const locked = state.kind === 'del';
      const cells = [];
      if (d.cls === 'In-frame deletion') {
        REF_AA.forEach((acid, ci) => {
          const gone = ci === d.deletedCodon;
          const bases = REF.slice(ci * 3, ci * 3 + 3).split('').map((letter) => baseButton(letter, 0, false, true));
          cells.push(codonEl(FIRST_CODON + ci, bases, gone ? null : acid, gone ? 'is-after' : ''));
          if (gone) cells[cells.length - 1].querySelector('.codon-aa').textContent = 'deleted';
        });
      } else {
        const acids = translate(d.seq);
        const count = Math.ceil(d.seq.length / 3);
        for (let ci = 0; ci < count; ci++) {
          const chunk = d.seq.slice(ci * 3, ci * 3 + 3);
          const bases = chunk.split('').map((letter, k) => {
            const index = ci * 3 + k;
            return baseButton(letter, locked ? 0 : FIRST_POS + index, index === d.changedIndex, locked);
          });
          const flags = [];
          if (ci === d.hitCodon && d.stopCodon !== ci) flags.push('is-hit');
          if (ci === d.stopCodon) flags.push('is-stop');
          if (d.stopCodon >= 0 && ci > d.stopCodon) flags.push('is-after');
          if (d.shiftFrom !== undefined && ci >= d.shiftFrom) flags.push('is-shift');
          cells.push(codonEl(FIRST_CODON + ci, bases, chunk.length === 3 ? acids[ci] : null, flags.join(' ')));
        }
      }
      // The bases are rebuilt on every change; put keyboard focus back on the base that was tapped.
      const active = document.activeElement;
      const focusPos = active && row.contains(active) ? active.dataset.pos : '';
      row.replaceChildren(...cells);
      const again = focusPos ? row.querySelector('.base[data-pos="' + focusPos + '"]') : null;
      if (again) again.focus({ preventScroll: true });
      chips.forEach((chip, i) => chip.setAttribute('aria-pressed', String(JSON.stringify(PRESETS[i].state) === JSON.stringify(state))));

      const names = d.cdna
        ? el('div', { class: 'hgvs' }, el('code', { text: d.cdna }), el('code', { text: d.protein }), d.short ? el('code', { text: d.short }) : null)
        : null;
      const isV600E = state.kind === 'sub' && state.pos === 1799 && state.alt === 'A';
      frame.readout.replaceChildren(...[names, el('p', { html: TEXT[d.cls] + (isV600E ? V600E : '') })].filter(Boolean));
    }
    render();
  });
})(window.MP);
