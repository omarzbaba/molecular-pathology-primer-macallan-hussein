/* Annotated report — an illustrative tumor sequencing report with eight
   numbered markers. Tapping a marker explains that part of the report. */
(function (MP) {
  'use strict';
  const { el } = MP;

  const NOTES = {
    1: ['Specimen and tumor content', 'What was tested, and how much of it was tumor. <strong>Forty percent tumor nuclei</strong> tells you how to read every allele fraction below — and whether a negative result can be trusted.'],
    2: ['The assay and its limit', 'Which genes were covered and how low the test can go. A variant in a gene that is not on the panel, or below the <strong>limit of detection</strong>, cannot be reported.'],
    3: ['Gene and variant name', 'The gene symbol, then the change at the DNA level (<code class="seq">c.</code>) and the protein level (<code class="seq">p.</code>). The name is exact enough for anyone to look the variant up.'],
    4: ['Variant allele fraction', 'The share of reads carrying the variant. <strong>22% in a 40% tumor</strong> fits a heterozygous mutation present in every tumor cell. The second variant, at 48%, is higher than this tumor could supply — a hint that it may be germline.'],
    5: ['Tier', 'The laboratory’s judgement of clinical significance. <strong>Tier I</strong> changes management now. <strong>Tier III</strong> is a variant of uncertain significance: reported for completeness, not for action.'],
    6: ['Pertinent negatives', 'What was looked for and not found. In lung cancer, knowing there is no <i>ALK</i>, <i>ROS1</i> or <i>RET</i> fusion matters as much as the positive result.'],
    7: ['Interpretation', 'The sentence that turns data into a result: what the finding means for this patient’s diagnosis, prognosis or treatment.'],
    8: ['Limitations', 'Every report says what the test cannot see. Read it — it tells you when a negative result needs another method, another specimen, or confirmation in normal tissue.']
  };

  MP.registerLab('report', function (mount) {
    const frame = MP.labFrame(mount, {
      title: 'Read a molecular report',
      hint: 'An illustrative report — not a real patient. Tap each numbered marker to see what that part is telling you.'
    });
    const seen = new Set();
    const side = el('div', { class: 'rep-side', 'aria-live': 'polite' });
    const buttons = {};

    function hot(n) {
      const button = el('button', { class: 'hot', type: 'button', 'aria-pressed': 'false', 'aria-label': 'Explain part ' + n + ': ' + NOTES[n][0], text: String(n) });
      button.addEventListener('click', () => open(n));
      buttons[n] = button;
      return button;
    }
    function open(n) {
      seen.add(n);
      Object.keys(buttons).forEach((key) => {
        buttons[key].setAttribute('aria-pressed', String(Number(key) === n));
        buttons[key].classList.toggle('is-seen', seen.has(Number(key)));
      });
      side.replaceChildren(
        el('h5', { text: n + ' · ' + NOTES[n][0] }), el('p', { html: NOTES[n][1] }),
        el('p', { class: 'rep-prog', text: seen.size + ' of 8 parts read' + (seen.size === 8 ? ' — that is the whole report.' : '') }));
      if (seen.size === 8) MP.store.markLab('report');
    }

    const doc = el('div', { class: 'rep-doc' },
      el('div', { class: 'rep-title' }, 'Tumor sequencing report', el('small', { text: 'Illustrative example for teaching' })),
      el('h5', null, 'Specimen ', hot(1)),
      el('p', { html: 'Lung, right upper lobe, core biopsy; formalin-fixed, paraffin-embedded. Adenocarcinoma. <strong>Tumor cellularity 40%.</strong>' }),
      el('h5', null, 'Assay ', hot(2)),
      el('p', { html: 'Targeted next-generation sequencing of DNA and RNA, 50 genes. Limit of detection: <strong>5% allele fraction</strong> for sequence variants.' }),
      el('h5', null, 'Results'),
      el('table', { class: 'rep-tbl' },
        el('thead', null, el('tr', null,
          el('th', null, 'Gene and variant ', hot(3)), el('th', null, 'VAF ', hot(4)), el('th', null, 'Tier ', hot(5)))),
        el('tbody', null,
          el('tr', null, el('td', { class: 'm', html: '<i>EGFR</i> c.2573T&gt;G<br>p.(Leu858Arg)' }), el('td', { class: 'm', text: '22%' }), el('td', { text: 'I' })),
          el('tr', null, el('td', { class: 'm', html: '<i>ATM</i> missense variant<br>(illustrative)' }), el('td', { class: 'm', text: '48%' }), el('td', { text: 'III' })))),
      el('h5', null, 'Not detected ', hot(6)),
      el('p', { html: 'No <i>ALK</i>, <i>ROS1</i>, <i>RET</i> or <i>NTRK</i> fusion. No <i>KRAS</i> or <i>BRAF</i> mutation. No <i>MET</i> exon 14 skipping.' }),
      el('h5', null, 'Interpretation ', hot(7)),
      el('p', { html: '<i>EGFR</i> p.Leu858Arg is a sensitizing mutation that predicts response to EGFR tyrosine-kinase inhibitors. The <i>ATM</i> variant is of uncertain significance; its allele fraction raises the possibility of germline origin, which this tumor-only test cannot determine; as a variant of uncertain significance it does not by itself call for germline testing.' }),
      el('h5', null, 'Limitations ', hot(8)),
      el('p', { html: 'This assay does not detect variants outside the genes listed, large rearrangements not covered by the RNA panel, or variants below the limit of detection. It does not distinguish germline from somatic variants.' }));

    side.replaceChildren(el('h5', { text: 'Start with marker 1' }), el('p', { text: 'A molecular report has the same eight parts every time. Once you know where to look, any laboratory’s report becomes readable.' }));
    frame.body.append(el('div', { class: 'rep' }, doc, side));
  });
})(window.MP);
