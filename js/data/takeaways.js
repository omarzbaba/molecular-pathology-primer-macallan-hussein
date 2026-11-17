/* What each stop asks the learner to carry away, the ten take-home points and
   the questions worth asking on service. Edit the text here; the page renders
   from these lists. Strings may contain simple inline markup. */
(function (MP) {
  'use strict';

  /** "Carry this away": three or four points per stop, keyed by stop id. */
  MP.data.carry = {
    s1: [
      "<strong>Three bases, one codon, one amino acid.</strong> A change is named at two levels: DNA (<code class=\"seq\">c.</code>) and protein (<code class=\"seq\">p.</code>).",
      "<strong>Six kinds of alteration.</strong> Decide which kind you are looking for before you choose the test.",
      "<strong>Germline</strong> is in every cell and heritable; <strong>somatic</strong> lives in the tumor only.",
      "<strong>Oncogenes</strong> need one activating hit; <strong>tumor suppressors</strong> need both copies lost."
    ],
    s2: [
      "<strong>EDTA for PCR; heparin for karyotype.</strong> Mixing them up is the classic avoidable failure.",
      "<strong>Formalin is fine; acid decalcification is not.</strong> Think about molecular testing before the tissue goes into the cassette.",
      "<strong>Tumor cellularity caps the signal.</strong> A heterozygous mutation in a sample with 20% tumor nuclei is present in only about 10% of the DNA.",
      "<strong>On a small biopsy, plan first.</strong> Request molecular studies up front and spend sections sparingly."
    ],
    s3: [
      "<strong>Denature, anneal, extend.</strong> Each cycle doubles the target; thirty cycles is about a billion-fold.",
      "<strong>Primers give PCR its specificity</strong> — and its blind spot: a variant under a primer can stop that copy amplifying.",
      "<strong>Low Ct means a lot of target; high Ct means little.</strong> About 3.3 cycles for every ten-fold difference.",
      "<strong>Every run carries controls:</strong> a positive, a no-template negative, and an internal control that proves the reaction worked."
    ],
    s4: [
      "<strong>Sanger for one known target; NGS for many genes or low-level variants.</strong>",
      "<strong>Depth</strong> is the number of reads over a position. <strong>Variant allele fraction (VAF)</strong> is variant reads divided by all reads.",
      "<strong>VAF is about half the tumor fraction</strong> for a heterozygous somatic mutation. A VAF near 50% whatever the tumor content suggests a germline variant.",
      "<strong>NGS does not see everything.</strong> Repeat expansions, large rearrangements and some copy-number changes need a specific design or a different test."
    ],
    s5: [
      "<strong>Match the test to the lesion.</strong> A base or a few: PCR or sequencing. A gene-sized gain or loss: FISH or microarray. A whole chromosome: karyotype or microarray.",
      "<strong>A balanced translocation moves DNA without losing any</strong> — karyotype, FISH and RNA-based tests can see it; a microarray cannot.",
      "<strong>Karyotyping needs living, dividing cells.</strong> Send fresh tissue in the right medium, not formalin.",
      "<strong>FISH patterns:</strong> a break-apart probe splits when its gene is rearranged; a fusion probe brings two colours together."
    ],
    s6: [
      "<strong>Two languages:</strong> five tiers for germline variants, four tiers for tumor variants.",
      "<strong>A VUS means “unknown”.</strong> Never act on it alone.",
      "<strong>Compare the VAF with the tumor content.</strong> About 50% in a tumor-only test may be germline and may deserve counseling and a confirmatory test.",
      "<strong>Read the limitations.</strong> What was covered, what cannot be seen, and how low the test can go."
    ],
    s7: [
      "<strong>Diagnosis, prognosis or prediction?</strong> Ask which job a biomarker is doing.",
      "<strong>A fusion can define a disease:</strong> <i>BCR::ABL1</i> is chronic myeloid leukemia; <i>PML::RARA</i> is acute promyelocytic leukemia.",
      "<strong>Mismatch-repair proteins work in pairs</strong> — MLH1 with PMS2, MSH2 with MSH6 — so the pattern of loss points to the gene.",
      "<strong>Suspected acute promyelocytic leukemia is an emergency.</strong> Treat first, confirm fast."
    ],
    s8: [
      "<strong>Diagnostic, predictive, carrier, prenatal, newborn</strong> — name the indication before you order.",
      "<strong>CYP2D6, CYP2C19, CYP2C9</strong> — the three pharmacogenes to recognise.",
      "<strong>Detect, quantify, type, resist</strong> — the four jobs of molecular microbiology.",
      "<strong>Consent before predictive testing</strong>, and remember where GINA’s protection stops."
    ]
  };

  /** The ten things to keep, shown in the wrap-up. */
  MP.data.keep = [
    "<strong>One trick underlies nearly every test:</strong> complementary strands find each other.",
    "<strong>Name the alteration first</strong> — base change, small insertion or deletion, copy number, fusion, repeat, methylation — then choose a test that can see it.",
    "<strong>EDTA for PCR, heparin for karyotype;</strong> formalin yes, acid decalcification no.",
    "<strong>Tumor cellularity caps the signal:</strong> a heterozygous variant shows at about half the tumor fraction.",
    "<strong>PCR doubles every cycle;</strong> a low Ct means a lot of target.",
    "<strong>Sanger:</strong> one target, 15–20% sensitivity. <strong>NGS:</strong> many genes, low-level variants, more time.",
    "<strong>Karyotype</strong> sees the whole genome coarsely; <strong>FISH</strong> answers one question fast; <strong>microarray</strong> counts copies but misses balanced swaps.",
    "<strong>Germline: five tiers. Somatic: four tiers.</strong> A variant of uncertain significance is never a reason to act.",
    "<strong>A negative result</strong> is only as good as the specimen, the test’s scope and its limit of detection.",
    "<strong>Suspected acute promyelocytic leukemia is an emergency;</strong> genetic results belong to families; consent comes first."
  ];

  /** Questions worth asking on service. */
  MP.data.ask = [
    "What is the tumor cellularity of this block — and is it enough?",
    "Is this variant germline or somatic, and how would we know?",
    "Could this test even detect a fusion, a deletion or a repeat?",
    "What is the limit of detection of this assay?",
    "Has this specimen been decalcified?"
  ];
})(window.MP);
