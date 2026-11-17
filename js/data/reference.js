/* Reference tables (supplementary). Each entry renders as one accordion.
   Table shape: { id, title, sub, cols[], rows: [{ c: [cells as HTML], lvl }] }
   Notes shape: { id, title, sub, notes: [{ h, p }] }                          */
(function (MP) {
  'use strict';

  MP.data.reference = [
    { id: 'heme', title: 'Blood cancers', sub: 'The molecular findings behind stop 7',
      cols: ['Disease', 'Finding', 'Why it matters'],
      rows: [
        { c: ['Chronic myeloid leukemia', '<i>BCR::ABL1</i>, t(9;22)', 'Defines the disease; tyrosine-kinase inhibitor; monitored on the International Scale'], lvl: 'core' },
        { c: ['Polycythemia vera', '<i>JAK2</i> V617F in about 95%; exon 12 in most of the rest', 'Confirms a clonal myeloproliferative neoplasm'], lvl: 'core' },
        { c: ['Essential thrombocythemia, primary myelofibrosis', '<i>JAK2</i> V617F, <i>CALR</i>, or <i>MPL</i>', 'One of the three is found in most cases; a few are “triple-negative”'], lvl: 'core' },
        { c: ['Acute promyelocytic leukemia', '<i>PML::RARA</i>, t(15;17)', 'An emergency; all-trans retinoic acid with arsenic trioxide'], lvl: 'next' },
        { c: ['Acute myeloid leukemia', '<i>NPM1</i>, <i>FLT3</i>, <i>CEBPA</i>; t(8;21), inv(16)', 'Sets the risk group; <i>FLT3</i> mutations add a targeted inhibitor'], lvl: 'next' },
        { c: ['B-lymphoblastic leukemia', '<i>BCR::ABL1</i> in a subset', 'Adds a tyrosine-kinase inhibitor to chemotherapy'], lvl: 'next' },
        { c: ['Myelodysplastic neoplasms', '<i>SF3B1</i>, <i>TP53</i>, deletion of 5q', 'Classification and prognosis'], lvl: 'next' },
        { c: ['Follicular lymphoma', '<i>IGH::BCL2</i>, t(14;18)', 'Supports the diagnosis'], lvl: 'next' },
        { c: ['Mantle cell lymphoma', '<i>IGH::CCND1</i>, t(11;14)', 'Diagnostic; cyclin D1 over-expression'], lvl: 'next' },
        { c: ['Burkitt lymphoma', '<i>MYC</i> rearrangement, usually t(8;14)', 'Diagnostic hallmark'], lvl: 'next' },
        { c: ['Chronic lymphocytic leukemia', 'Deletion of 17p or <i>TP53</i> mutation; <i>IGHV</i> status', 'Predicts failure of chemo-immunotherapy and directs targeted therapy'], lvl: 'next' },
        { c: ['Hairy cell leukemia', '<i>BRAF</i> V600E', 'Present in nearly all classic cases'], lvl: 'next' },
        { c: ['Lymphoplasmacytic lymphoma', '<i>MYD88</i> L265P', 'Present in most cases'], lvl: 'next' },
        { c: ['Systemic mastocytosis', '<i>KIT</i> D816V', 'A diagnostic criterion; resistant to imatinib'], lvl: 'next' },
        { c: ['Any lymphoid proliferation', 'Immunoglobulin or T-cell receptor gene rearrangement by PCR', 'A single dominant peak supports clonality'], lvl: 'next' },
        { c: ['After a stem-cell transplant', 'Short tandem repeat chimerism', 'Tracks the proportion of donor cells'], lvl: 'next' }
      ] },

    { id: 'inherited', title: 'Inherited diseases', sub: 'The core conditions and how they are found',
      cols: ['Condition', 'Gene and typical change', 'Inheritance', 'Worth knowing'],
      rows: [
        { c: ['Cystic fibrosis', '<i>CFTR</i>; p.Phe508del is the commonest', 'Autosomal recessive', 'Carrier screening is routine; some treatments depend on the genotype'], lvl: 'core' },
        { c: ['Sickle cell disease', '<i>HBB</i>, glutamate to valine (HbS)', 'Autosomal recessive', 'One base, one amino acid — the classic point mutation'], lvl: 'core' },
        { c: ['Thalassemias', 'Deletions of the alpha-globin genes; point mutations in <i>HBB</i>', 'Autosomal recessive', 'Different mechanisms need different tests'], lvl: 'core' },
        { c: ['Hereditary hemochromatosis', '<i>HFE</i> C282Y, homozygous', 'Autosomal recessive', 'Common genotype, low penetrance'], lvl: 'core' },
        { c: ['Factor V Leiden', '<i>F5</i> R506Q', 'Autosomal dominant risk factor', 'Resistance to activated protein C; the commonest inherited thrombophilia in people of European ancestry'], lvl: 'core' },
        { c: ['Prothrombin G20210A', '<i>F2</i>, a change outside the coding region', 'Autosomal dominant risk factor', 'Raises prothrombin levels'], lvl: 'core' },
        { c: ['Hemophilia A', '<i>F8</i>; an inversion in about half of severe cases', 'X-linked recessive', 'The inversion is missed by ordinary sequencing'], lvl: 'core' },
        { c: ['Fragile X syndrome', '<i>FMR1</i> CGG repeats over 200, methylated', 'X-linked', 'The commonest inherited cause of intellectual disability'], lvl: 'core' },
        { c: ['Huntington disease', '<i>HTT</i> CAG repeats, 36 or more (fully penetrant from 40)', 'Autosomal dominant', 'Anticipation, especially through fathers; predictive testing needs counseling'], lvl: 'core' },
        { c: ['Duchenne and Becker muscular dystrophy', '<i>DMD</i> deletions', 'X-linked recessive', 'Frame-shifting deletions cause Duchenne; in-frame deletions cause the milder Becker form'], lvl: 'core' },
        { c: ['Prader-Willi and Angelman syndromes', '15q11–q13', 'Imprinting', 'Loss of the father’s copy causes Prader-Willi; loss of the mother’s causes Angelman. A methylation test comes first'], lvl: 'core' },
        { c: ['Down syndrome', 'Trisomy 21', 'Usually sporadic', 'A minority arise from a translocation that can recur in the family'], lvl: 'core' },
        { c: ['Alpha-1 antitrypsin deficiency', '<i>SERPINA1</i>, the Z allele', 'Autosomal recessive', 'Emphysema and liver disease'], lvl: 'core' },
        { c: ['Mitochondrial disease', 'Mitochondrial DNA, for example m.3243A&gt;G', 'Maternal', 'Heteroplasmy explains the variable severity'], lvl: 'core' },
        { c: ['22q11.2 deletion syndrome', 'A 3-megabase deletion', 'Mostly new; dominant when passed on', 'Found by microarray or FISH, not by karyotype'], lvl: 'next' },
        { c: ['Spinal muscular atrophy', 'Deletion of <i>SMN1</i>', 'Autosomal recessive', 'The number of <i>SMN2</i> copies modifies severity'], lvl: 'preview' }
      ] },

    { id: 'syndromes', title: 'Inherited cancer syndromes', sub: 'When a tumor is a clue about a family',
      cols: ['Syndrome', 'Gene', 'Tumors', 'Clue'],
      rows: [
        { c: ['Lynch syndrome', '<i>MLH1</i>, <i>MSH2</i>, <i>MSH6</i>, <i>PMS2</i>', 'Colon, endometrium, ovary, stomach, urinary tract', 'Mismatch-repair loss in the tumor'], lvl: 'core' },
        { c: ['Familial adenomatous polyposis', '<i>APC</i>', 'Hundreds of colonic adenomas, then carcinoma', 'Polyps in adolescence'], lvl: 'core' },
        { c: ['Hereditary breast and ovarian cancer', '<i>BRCA1</i>, <i>BRCA2</i>', 'Breast, ovary, prostate, pancreas', 'Young onset; PARP inhibitors'], lvl: 'core' },
        { c: ['Li-Fraumeni syndrome', '<i>TP53</i>', 'Sarcoma, breast, brain, adrenal', 'Many tumors, very early'], lvl: 'core' },
        { c: ['Von Hippel-Lindau disease', '<i>VHL</i>', 'Clear cell kidney cancer, hemangioblastoma, pheochromocytoma', 'Multiple, bilateral tumors'], lvl: 'core' },
        { c: ['Multiple endocrine neoplasia type 1', '<i>MEN1</i>', 'Parathyroid, pituitary, pancreas', 'The three Ps'], lvl: 'core' },
        { c: ['Multiple endocrine neoplasia type 2', '<i>RET</i>, activating', 'Medullary thyroid carcinoma, pheochromocytoma', 'A rare inherited oncogene; preventive thyroidectomy'], lvl: 'core' },
        { c: ['Neurofibromatosis type 1', '<i>NF1</i>', 'Neurofibromas, optic glioma', 'Café-au-lait spots'], lvl: 'core' },
        { c: ['MUTYH-associated polyposis', '<i>MUTYH</i>', 'Colonic adenomas and carcinoma', 'Recessive — unlike most cancer syndromes'], lvl: 'next' },
        { c: ['Peutz-Jeghers syndrome', '<i>STK11</i>', 'Hamartomatous polyps; gut, pancreas, breast', 'Pigmented spots on the lips'], lvl: 'next' },
        { c: ['Hereditary diffuse gastric cancer', '<i>CDH1</i>', 'Diffuse gastric and lobular breast carcinoma', 'Signet-ring cells in a young adult'], lvl: 'next' }
      ] },

    { id: 'pgx', title: 'Pharmacogenes', sub: 'Inherited differences in drug handling',
      cols: ['Gene', 'Drug', 'What happens'],
      rows: [
        { c: ['<i>CYP2D6</i>', 'Codeine, tramadol; tamoxifen', 'Poor metabolizers get little effect from these pro-drugs; ultra-rapid metabolizers risk opioid toxicity'], lvl: 'core' },
        { c: ['<i>CYP2C19</i>', 'Clopidogrel', 'Poor metabolizers form too little active drug'], lvl: 'core' },
        { c: ['<i>CYP2C9</i> with <i>VKORC1</i>', 'Warfarin', 'Variants call for a lower dose'], lvl: 'core' },
        { c: ['<i>TPMT</i>, <i>NUDT15</i>', 'Azathioprine, mercaptopurine', 'Severe bone-marrow suppression at standard doses'], lvl: 'preview' },
        { c: ['<i>DPYD</i>', 'Fluorouracil, capecitabine', 'Severe, sometimes fatal toxicity'], lvl: 'preview' },
        { c: ['<i>UGT1A1</i>', 'Irinotecan', 'Neutropenia'], lvl: 'preview' },
        { c: ['<i>HLA-B*57:01</i>', 'Abacavir', 'Hypersensitivity; tested before prescribing'], lvl: 'preview' },
        { c: ['<i>HLA-B*15:02</i>', 'Carbamazepine', 'Stevens-Johnson syndrome; screened in patients of Asian ancestry'], lvl: 'preview' },
        { c: ['<i>G6PD</i>', 'Rasburicase, primaquine, dapsone', 'Hemolysis'], lvl: 'preview' }
      ] },

    { id: 'infection', title: 'Infections', sub: 'What the molecular test is for, and its catch',
      cols: ['Organism', 'Test', 'Use', 'Catch'],
      rows: [
        { c: ['HIV', 'RNA viral load; resistance genotype', 'Monitors treatment; guides drug choice', 'Diagnosis begins with an antigen–antibody test'], lvl: 'core' },
        { c: ['Hepatitis B', 'DNA viral load', 'Decides and monitors treatment', 'Read with the serology'], lvl: 'core' },
        { c: ['Hepatitis C', 'RNA', 'Confirms active infection; undetectable 12 weeks after therapy means cure', 'Antibody stays positive for life'], lvl: 'core' },
        { c: ['Human papillomavirus', 'High-risk types; 16 and 18 called separately', 'Cervical screening', 'Most infections clear without harm'], lvl: 'core' },
        { c: ['MRSA', '<i>mecA</i> / <i>mecC</i>', 'Screening and rapid identification', 'Detects the gene, not active infection'], lvl: 'core' },
        { c: ['<i>Clostridioides difficile</i>', 'Toxin gene', 'Diarrheal illness', 'Also positive in carriers: test only unformed stool'], lvl: 'core' },
        { c: ['Respiratory viruses', 'Multiplex RT-PCR', 'Influenza, RSV, SARS-CoV-2 and others at once', 'Can stay positive after recovery'], lvl: 'next' },
        { c: ['Cytomegalovirus, EBV, BK virus', 'Viral load in international units', 'Monitoring after transplantation', 'Follow the trend; about a three-fold change is meaningful'], lvl: 'next' },
        { c: ['Herpes simplex virus in spinal fluid', 'PCR', 'The test of choice for encephalitis', 'Can be negative very early'], lvl: 'next' },
        { c: ['Chlamydia and gonorrhea', 'Nucleic acid amplification', 'The test of choice', 'Retesting too soon finds remnants'], lvl: 'next' },
        { c: ['<i>Mycobacterium tuberculosis</i>', 'PCR including <i>rpoB</i>', 'Rapid detection with rifampin resistance', 'Culture is still needed'], lvl: 'next' },
        { c: ['Culture-negative infection', '16S ribosomal RNA gene sequencing', 'Names bacteria that will not grow', 'Slow, and less sensitive than targeted PCR'], lvl: 'preview' }
      ] },

    { id: 'quality', title: 'Quality, law and identity', sub: 'The professional layer under every result',
      notes: [
        { h: 'Controls in every run', p: 'A <strong>positive</strong> control shows the assay can detect the target. A <strong>no-template</strong> control shows nothing is contaminated. An <strong>internal</strong> control inside each patient reaction shows that extraction and amplification worked.' },
        { h: 'Validation and verification', p: 'A laboratory that designs its own test must <strong>validate</strong> it: accuracy, precision, the limit of detection and the reportable range. For a cleared commercial test it <strong>verifies</strong> that the published performance holds in its own hands.' },
        { h: 'Proficiency testing', p: 'Laboratories regularly test blinded samples from an outside agency and are graded against their peers. It is a requirement of accreditation.' },
        { h: 'One-way workflow', p: 'Reagent preparation, then specimen preparation, then amplification and detection — in separate spaces, never backwards. Amplified product is the main source of false positives.' },
        { h: 'Identity testing', p: 'Short tandem repeats give each person a DNA fingerprint. It settles a suspected <strong>specimen mix-up</strong>, measures <strong>donor chimerism</strong> after transplantation, and excludes <strong>maternal cell contamination</strong> in a prenatal sample.' },
        { h: 'Consent and children', p: 'Predictive testing follows counseling and informed consent. Children are generally not tested for adult-onset conditions unless something can be done in childhood.' },
        { h: 'Unexpected findings', p: 'Broad sequencing can reveal a serious, actionable variant unrelated to the reason for testing. Patients are told about this possibility in advance and can decline to receive such results.' },
        { h: 'Privacy and discrimination law', p: '<strong>HIPAA</strong> protects the confidentiality of the result. <strong>GINA</strong> prohibits genetic discrimination in health insurance and employment, but not in life, disability or long-term-care insurance.' }
      ] }
  ];
})(window.MP);
