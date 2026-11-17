/* Session plan, objectives, the six kinds of alteration, and the curated videos.
   Edit the text here; the page renders from these lists. */
(function (MP) {
  'use strict';

  /** The guided path. `min` is the planned time; the header clock uses it. */
  MP.data.stops = [
    { id: 'start', n: '00', title: 'Start here', sub: 'The one idea, and the plan', min: 5 },
    { id: 's1', n: '01', title: 'Read the language', sub: 'Genes, variants and their names', min: 12 },
    { id: 's2', n: '02', title: 'Protect the specimen', sub: 'Tube, fixative, tumor cellularity', min: 8 },
    { id: 's3', n: '03', title: 'Amplify', sub: 'PCR and the Ct value', min: 10 },
    { id: 's4', n: '04', title: 'Sequence', sub: 'Sanger, NGS, depth and allele fraction', min: 10 },
    { id: 's5', n: '05', title: 'Chromosomes', sub: 'Karyotype, FISH, microarray — and choosing', min: 10 },
    { id: 's6', n: '06', title: 'Interpret', sub: 'Tiers, uncertainty and limits', min: 10 },
    { id: 's7', n: '07', title: 'In cancer', sub: 'Nine results that change care', min: 10 },
    { id: 's8', n: '08', title: 'Beyond cancer', sub: 'Inheritance, drugs, infection', min: 7 },
    { id: 'wrap', n: '09', title: 'Wrap-up', sub: 'Two cases, ten things to keep', min: 8 }
  ];

  /** One objective per stop, mapped to ABPath Molecular Genetic Pathology sections. */
  MP.data.objectives = [
    { n: 1, stop: 's1', title: 'Read the language', text: 'Trace a gene to its protein, name the six kinds of alteration, and read a variant name.', abp: 'ABPath §1–2' },
    { n: 2, stop: 's2', title: 'Protect the specimen', text: 'Choose the tube and fixative, avoid acid decalcification, estimate tumor cellularity.', abp: 'ABPath §4' },
    { n: 3, stop: 's3', title: 'Amplify', text: 'Explain PCR, reverse transcription and real-time PCR, and read a Ct value.', abp: 'ABPath §3, §5' },
    { n: 4, stop: 's4', title: 'Sequence', text: 'Compare Sanger with NGS; use depth, allele fraction and limit of detection.', abp: 'ABPath §3' },
    { n: 5, stop: 's5', title: 'See chromosomes', text: 'Match karyotype, FISH, microarray and sequencing to the lesion each can detect.', abp: 'ABPath §3' },
    { n: 6, stop: 's6', title: 'Interpret the report', text: 'Tell germline from somatic, use the tier languages, and handle uncertainty.', abp: 'ABPath §4, §16' },
    { n: 7, stop: 's7', title: 'Molecular in cancer', text: 'Link nine core results to the action each one triggers.', abp: 'ABPath §10–11' },
    { n: 8, stop: 's8', title: 'Beyond cancer', text: 'Recognise inherited-disease, drug-response and infection questions, and the rules of consent.', abp: 'ABPath §6–9, §12–13' }
  ];

  /** Six kinds of alteration. `art` names a drawing in widgets.js. */
  MP.data.six = [
    { art: 'snv', title: 'Single-base change', text: 'One letter swapped for another. BRAF V600E; the sickle cell variant.', test: 'PCR · sequencing' },
    { art: 'indel', title: 'Small insertion or deletion', text: 'A few letters added or lost; may shift the reading frame. CFTR F508del; EGFR exon 19 deletion.', test: 'PCR · sequencing' },
    { art: 'cnv', title: 'Copy-number change', text: 'Too many or too few copies — of one gene or a whole chromosome. HER2 amplification; trisomy 21.', test: 'FISH · microarray · karyotype' },
    { art: 'fusion', title: 'Rearrangement and fusion', text: 'Two distant genes joined into one. BCR::ABL1; EML4::ALK.', test: 'Karyotype · FISH · RNA-based tests' },
    { art: 'repeat', title: 'Repeat expansion', text: 'A short motif stutters past a threshold. Huntington disease (CAG); fragile X (CGG).', test: 'PCR sizing · Southern blot' },
    { art: 'methyl', title: 'Silencing by methylation', text: 'The sequence is intact but the gene is switched off. MLH1 and MGMT promoters; imprinting.', test: 'Methylation-specific assays' }
  ];

  /** Public videos, verified embeddable. Loaded only when the viewer clicks. */
  MP.data.videos = {
    pcr: { id: '2KoLnIwoZKU', title: 'Polymerase chain reaction', by: 'Cold Spring Harbor Laboratory · DNA Learning Center', note: 'A 90-second 3D animation of the cycle.' },
    sanger: { id: '6ldtdWjDwes', title: 'Sanger sequencing', by: 'Cold Spring Harbor Laboratory · DNA Learning Center', note: 'Chain termination, one base at a time.' },
    sbs: { id: 'fCd6B5HRaZ8', title: 'Sequencing by synthesis', by: 'Illumina', note: 'How next-generation sequencing reads millions of fragments at once.' },
    fish: { id: 'RxkdLH0tgUY', title: 'Fluorescence in situ hybridization', by: 'Emory University · CancerQuest', note: 'How a labelled probe finds its target in a cell.' }
  };

  MP.data.totalMinutes = MP.data.stops.reduce((sum, stop) => sum + stop.min, 0);
})(window.MP);
