/* Small tables shown inside the "Go deeper" drawers of each stop.
   Shape: tables[id] = { cols[], rows: [{ c: [cells as HTML], lvl? }] }
   A [data-table="id"] element in index.html is filled from here. */
(function (MP) {
  'use strict';

  MP.data.tables = {
    naming: {
      cols: ['What', 'How it is written', 'Example'],
      rows: [
        { c: ['Gene', 'Official symbol, in italics. The protein and the everyday name are not.', '<i>ERBB2</i> encodes HER2'] },
        { c: ['DNA change', '<code>c.</code> + position in the coding sequence + the change', '<code>c.1799T&gt;A</code>'] },
        { c: ['Protein change', '<code>p.</code> + original amino acid, position, new amino acid', '<code>p.Val600Glu</code> (V600E)'] },
        { c: ['Deletion, duplication', '<code>del</code>, <code>dup</code>, <code>ins</code>; <code>fs</code> for a frameshift; <code>Ter</code> or <code>*</code> for a stop', '<code>p.Phe508del</code>'] },
        { c: ['Fusion', 'Two gene symbols joined by a double colon, 5′ partner first', '<i>BCR::ABL1</i>'] }
      ]
    },
    inherit: {
      cols: ['Pattern', 'Clue in the family', 'Examples'],
      rows: [
        { c: ['Autosomal dominant', 'Every generation; each child has a 50% chance', 'Huntington disease, Lynch syndrome, <i>BRCA1/2</i>, Marfan syndrome'] },
        { c: ['Autosomal recessive', 'Siblings affected, parents are healthy carriers; 25% chance', 'Cystic fibrosis, sickle cell disease, hemochromatosis'] },
        { c: ['X-linked recessive', 'Males affected through carrier mothers; never father to son', 'Hemophilia A and B, Duchenne muscular dystrophy'] },
        { c: ['Mitochondrial', 'Passed by mothers to all children; severity varies with the share of mutant mitochondria', 'MELAS, Leber hereditary optic neuropathy'] },
        { c: ['Repeat expansion', 'Earlier and more severe in successive generations (anticipation)', 'Huntington disease (CAG), fragile X (CGG), myotonic dystrophy (CTG)'] },
        { c: ['Imprinting', 'Which parent the copy came from decides the disease', 'Prader-Willi and Angelman syndromes (15q11–q13)'] }
      ]
    },
    specimens: {
      cols: ['Specimen', 'Good for', 'Watch out for'],
      rows: [
        { c: ['Formalin-fixed, paraffin-embedded tissue', 'Most solid-tumor testing; the pathologist can pick the block and mark the tumor', 'Over- or under-fixation, decalcification, low tumor content, necrosis'] },
        { c: ['Blood or marrow in EDTA', 'Leukemia testing, inherited disease, viral loads', 'Heparin tubes; delay in transport for RNA-based tests'] },
        { c: ['Cytology (cell block, smears)', 'Often excellent DNA; may be the only material in lung cancer', 'Scant cellularity'] },
        { c: ['Fresh or frozen tissue', 'Best-quality DNA and RNA; cytogenetics needs it fresh', 'Must be planned at the time of the procedure'] },
        { c: ['Plasma (cell-free DNA)', '“Liquid biopsy” when tissue is unavailable; monitoring', 'Special tubes or rapid processing; tumor DNA can be very scarce'] },
        { c: ['Saliva or cheek swab', 'Inherited (germline) testing', 'Not suitable after an allogeneic marrow transplant'] }
      ]
    },
    pcrfamily: {
      cols: ['Method', 'What it adds', 'Typical use'],
      rows: [
        { c: ['PCR with fragment sizing', 'Products separated by size on a capillary', 'Repeat expansions, microsatellite instability, clonality, chimerism'] },
        { c: ['Real-time (quantitative) PCR', 'A fluorescent read-out every cycle; Ct', 'Viral loads, <i>BCR::ABL1</i> monitoring, rapid mutation tests'] },
        { c: ['Reverse-transcription PCR', 'Starts from RNA', 'RNA viruses, fusion transcripts'] },
        { c: ['Digital PCR', 'Splits the sample into thousands of tiny reactions and counts the positives', 'Very low-level variants; absolute quantification'], lvl: 'next' },
        { c: ['Isothermal amplification', 'No thermal cycling; fast and simple', 'Point-of-care infectious disease tests'], lvl: 'next' },
        { c: ['Methylation-specific PCR', 'Bisulfite converts unmethylated cytosine to uracil first', '<i>MLH1</i> and <i>MGMT</i> promoter methylation'], lvl: 'preview' }
      ]
    },
    scope: {
      cols: ['Scope', 'What is sequenced', 'Typical use'],
      rows: [
        { c: ['Targeted panel', 'Tens to hundreds of chosen genes, read very deeply', 'Tumor profiling; a defined inherited condition'] },
        { c: ['Exome', 'The protein-coding 1–2% of the genome', 'Unexplained suspected genetic disease'] },
        { c: ['Genome', 'Everything, including non-coding DNA; better for structural change', 'Rare disease when the exome is uninformative'] },
        { c: ['RNA sequencing', 'Expressed transcripts', 'Gene fusions, exon skipping'] }
      ]
    },
    karyo: {
      cols: ['Written', 'Means'],
      rows: [
        { c: ['<code>46,XX</code>', 'Normal female: 46 chromosomes, two X'] },
        { c: ['<code>47,XY,+21</code>', 'Male with an extra chromosome 21 (Down syndrome)'] },
        { c: ['<code>t(9;22)(q34;q11.2)</code>', 'Translocation between the long arms of 9 and 22: the Philadelphia chromosome'] },
        { c: ['<code>del(5q)</code>', 'Deletion of part of the long arm of chromosome 5'] },
        { c: ['<code>inv(16)</code>', 'Inversion within chromosome 16'] }
      ]
    },
    probes: {
      cols: ['Design', 'Normal', 'Abnormal', 'Example'],
      rows: [
        { c: ['Break-apart', 'Two fused signals', 'One fused, one red and one green apart', '<i>ALK</i>, <i>EWSR1</i>, <i>MYC</i>'] },
        { c: ['Dual-colour, dual-fusion', 'Two red, two green', 'One red, one green, two fusions', '<i>BCR::ABL1</i>, <i>IGH::BCL2</i>'] },
        { c: ['Enumeration with a control', 'Two gene, two centromere', 'Many gene signals per centromere', '<i>ERBB2</i> (HER2) / CEP17'] },
        { c: ['Deletion', 'Two gene, two control', 'One gene, two control', '<i>TP53</i> at 17p13; 1p and 19q'] }
      ]
    }
  };
})(window.MP);
