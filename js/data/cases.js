/* Cases, revealed one decision at a time.
   slot: 'wrap' (worked in the session) or 'lab' (on your own).
   Shape: { id, slot, tag, title, blurb, facts?: [[label, value]], steps: [{ ask, answer }] } */
(function (MP) {
  'use strict';

  MP.data.cases = [
    { id: 'c-lung', slot: 'wrap', tag: 'Specimen · sequencing · solid tumor', title: 'Three small cores',
      blurb: 'A 61-year-old who has never smoked has a 3 cm lung mass. Three thin needle cores show adenocarcinoma.',
      steps: [
        { ask: 'Before any stains are ordered — what is the pathologist’s first molecular decision?',
          answer: '<strong>Protect the tissue.</strong> Use the fewest immunostains needed for the diagnosis, cut unstained sections for molecular testing at the same sitting, and record the tumor cellularity. On a small biopsy the tissue runs out before the questions do.' },
        { ask: 'Which molecular test do you request?',
          answer: 'A <strong>broad NGS panel that reads both DNA and RNA</strong>, so one test covers mutations (<i>EGFR</i>, <i>KRAS</i>, <i>BRAF</i>) and fusions (<i>ALK</i>, <i>ROS1</i>, <i>RET</i>), alongside PD-L1 immunohistochemistry. Testing one gene at a time would exhaust the sample.' },
        { ask: 'The report: <i>EGFR</i> exon 19 deletion, allele fraction 19%; tumor cellularity 40%. Does the number make sense, and what does it mean?',
          answer: 'Yes — a heterozygous mutation in a sample that is 40% tumor should sit near <strong>20%</strong>. An exon 19 deletion is a <strong>Tier I</strong> sensitizing mutation: it predicts response to an EGFR tyrosine-kinase inhibitor.' }
      ] },

    { id: 'c-lynch', slot: 'wrap', tag: 'Mismatch repair · inherited cancer', title: 'Colon cancer at 42',
      blurb: 'A right-sided colon cancer is resected from a 42-year-old woman. The mismatch-repair immunostains are back.',
      facts: [['MLH1', 'retained'], ['PMS2', 'retained'], ['MSH2', 'lost'], ['MSH6', 'lost']],
      steps: [
        { ask: 'What does this staining pattern tell you?',
          answer: 'MSH2 and MSH6 work as a pair. When <strong>MSH2</strong> fails, its partner MSH6 is degraded, so both disappear. The tumor is mismatch-repair deficient, and the gene to suspect is <i>MSH2</i>.' },
        { ask: 'Sporadic or inherited — what do you do next?',
          answer: 'Loss of MSH2 and MSH6 is not explained by promoter methylation, so — unlike MLH1 loss — there is no methylation or <i>BRAF</i> step: refer for <strong>genetic counseling and germline testing</strong> for Lynch syndrome.' },
        { ask: 'Who else does this result matter to?',
          answer: 'Her <strong>relatives</strong>: Lynch syndrome is autosomal dominant, so each first-degree relative has a 50% chance of carrying it and benefits from earlier colonoscopy. And her <strong>oncologist</strong>: mismatch-repair-deficient tumors respond to immune checkpoint inhibitors.' }
      ] },

    { id: 'c-cml', slot: 'lab', tag: 'Blood cancer · monitoring', title: 'A white count of 180,000',
      blurb: 'A 48-year-old has an enlarged spleen and a white cell count of 180 × 10⁹/L with every stage of granulocyte maturation and a basophilia.',
      steps: [
        { ask: 'Which molecular finding makes the diagnosis, and how do you look for it?',
          answer: '<strong><i>BCR::ABL1</i></strong>, the product of t(9;22). FISH or RT-PCR on blood confirms it quickly; a marrow karyotype shows the Philadelphia chromosome and any additional abnormalities.' },
        { ask: 'How will you follow the response to a tyrosine-kinase inhibitor?',
          answer: 'Quantitative RT-PCR for <i>BCR::ABL1</i> on the <strong>International Scale</strong>, about every three months. The goal is a <strong>major molecular response: 0.1% or less</strong>.' },
        { ask: 'Two years on, the level climbs from 0.05% to 2%. What now?',
          answer: 'Confirm the rise, then ask about adherence and drug interactions. If the rise is real, test the kinase domain for a <strong>resistance mutation</strong> — T315I, for example, needs a drug designed to work against it.' }
      ] },

    { id: 'c-decal', slot: 'lab', tag: 'Specimen', title: 'The bone biopsy that failed',
      blurb: 'A vertebral biopsy shows metastatic carcinoma. The sequencing laboratory reports: “Failed quality control — DNA too degraded to test.”',
      steps: [
        { ask: 'What most likely happened?',
          answer: 'The core was decalcified in <strong>strong acid</strong> so that it could be sectioned. The acid broke the DNA into fragments too small and too damaged to sequence.' },
        { ask: 'What are the options now?',
          answer: 'Look for material that was <strong>not decalcified</strong>: a cell block or needle aspirate from the same procedure, a soft-tissue component, or another site. If nothing remains, a <strong>plasma cell-free DNA</strong> test is a reasonable alternative.' },
        { ask: 'How is this prevented next time?',
          answer: 'By deciding before the cassette is closed: split the specimen, keep a piece out of decalcifier, or request <strong>EDTA decalcification</strong> whenever a bone lesion might be tumor.' }
      ] },

    { id: 'c-germ', slot: 'lab', tag: 'Interpretation', title: 'A result nobody ordered',
      blurb: 'Tumor-only sequencing in a 38-year-old with breast cancer reports a pathogenic <i>BRCA1</i> variant.',
      facts: [['Allele fraction', '52%'], ['Tumor cellularity', '35%']],
      steps: [
        { ask: 'What do the two numbers suggest when you put them together?',
          answer: 'A 35% tumor could contribute at most a modest fraction of mutant alleles. <strong>Fifty-two percent means the variant is in the normal cells as well</strong> — it is probably germline.' },
        { ask: 'Can the tumor report say she has a hereditary cancer syndrome?',
          answer: 'No. Tumor-only testing cannot prove germline origin. The report should flag the possibility and recommend <strong>genetic counseling and a confirmatory test on blood or saliva</strong>.' },
        { ask: 'If it is confirmed, what changes?',
          answer: 'Her treatment (eligibility for a <strong>PARP inhibitor</strong>), her own future screening and surgical choices, and her <strong>relatives’</strong> options for testing. Counseling also covers what the law protects and what it does not.' }
      ] },

    { id: 'c-fragx', slot: 'lab', tag: 'Inherited disease', title: 'Late to talk',
      blurb: 'A 3-year-old boy has speech delay and hyperactivity. A maternal uncle has intellectual disability.',
      steps: [
        { ask: 'Which genetic tests come first?',
          answer: 'A <strong>chromosomal microarray</strong> and <strong>fragile X testing</strong> — the two first-line tests for unexplained developmental delay. They look for different things: copy-number change and a repeat expansion.' },
        { ask: 'The <i>FMR1</i> result: more than 200 CGG repeats, methylated. Why would an exome have missed it?',
          answer: 'That is a <strong>full mutation</strong>: the expanded repeat is methylated and the gene is silenced. Short-read sequencing cannot size long repeats, so the test is PCR with fragment analysis, sometimes with Southern blotting.' },
        { ask: 'What does this mean for his mother?',
          answer: 'She is an obligate carrier of an expanded allele — a <strong>premutation</strong> (55–200 repeats) or a full mutation of her own — and should be tested. Premutation carriers face their own risks — early ovarian insufficiency, and a tremor–ataxia syndrome later in life — and the family needs counseling.' }
      ] },

    { id: 'c-pcr', slot: 'lab', tag: 'Infection', title: 'Still positive',
      blurb: 'Three weeks after recovering from a respiratory viral infection, a patient has a pre-procedure PCR. It is positive, with a high Ct value.',
      steps: [
        { ask: 'Does the result mean the patient is still infectious?',
          answer: 'Not necessarily. PCR detects <strong>nucleic acid</strong>, which can linger for weeks after recovery. It cannot tell living virus from fragments.' },
        { ask: 'How much weight does the Ct value carry?',
          answer: 'A high Ct means little target, which fits a resolving infection. But Ct values are <strong>not standardised</strong> between assays, and they shift with how well the swab was taken. Interpret them with the timing and the symptoms.' },
        { ask: 'What is the general lesson?',
          answer: 'Do not use a nucleic-acid test as an <strong>early test of cure</strong>. The same rule applies to <i>C. difficile</i> and to sexually transmitted infections, where retesting too soon finds harmless remnants.' }
      ] },

    { id: 'c-pgx', slot: 'lab', tag: 'Drug response', title: 'The right drug, the wrong genes',
      blurb: 'A 58-year-old has a coronary stent placed and starts clopidogrel. Ten days later the stent clots. Genotyping shows two non-functioning <i>CYP2C19</i> alleles.',
      steps: [
        { ask: 'Why did the drug fail?',
          answer: 'Clopidogrel is a <strong>pro-drug</strong>. CYP2C19 converts it to its active form. With two non-functioning alleles — a poor metabolizer — very little active drug is made.' },
        { ask: 'What should change?',
          answer: 'Switch to an antiplatelet drug that does <strong>not depend on CYP2C19</strong> for activation.' },
        { ask: 'How long is this result valid?',
          answer: 'For life. It is a <strong>germline</strong> result, so it also applies to every other drug that CYP2C19 handles — and it belongs in the record where the next prescriber will see it.' }
      ] }
  ];
})(window.MP);
