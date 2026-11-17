/* Biomarker atlas (supplementary). Shape: { site, marker, why, test, level }
   level: 'core' | 'next' | 'preview' — the ABPath designation of the item.
   Drug names are examples of a class, not recommendations. */
(function (MP) {
  'use strict';

  MP.data.atlas = [
    { site: 'Lung', marker: 'EGFR exon 19 deletion, L858R', why: 'Sensitizing mutations: an EGFR tyrosine-kinase inhibitor such as osimertinib.', test: 'PCR · NGS', level: 'core' },
    { site: 'Lung', marker: 'KRAS G12C', why: 'Targetable with KRAS G12C inhibitors. KRAS mutations are common in smokers and rarely coexist with EGFR or ALK changes.', test: 'PCR · NGS', level: 'core' },
    { site: 'Lung', marker: 'ALK fusion', why: 'ALK inhibitors such as alectinib or lorlatinib.', test: 'Immunohistochemistry · FISH · RNA sequencing', level: 'next' },
    { site: 'Lung', marker: 'ROS1 fusion', why: 'ROS1 inhibitors such as crizotinib or entrectinib.', test: 'FISH · RNA sequencing', level: 'next' },
    { site: 'Lung', marker: 'BRAF V600E', why: 'Combined BRAF and MEK inhibition.', test: 'NGS', level: 'next' },
    { site: 'Lung', marker: 'RET fusion', why: 'Selective RET inhibitors such as selpercatinib.', test: 'RNA sequencing · FISH', level: 'next' },
    { site: 'Lung', marker: 'EGFR T790M, C797S', why: 'Resistance mutations acquired on treatment; they redirect therapy.', test: 'NGS on tissue or plasma', level: 'next' },
    { site: 'Lung', marker: 'MET exon 14 skipping', why: 'MET inhibitors. Detected most reliably from RNA.', test: 'RNA sequencing', level: 'preview' },
    { site: 'Lung', marker: 'PD-L1 (protein)', why: 'An immunostain, not a molecular test, ordered alongside: it guides immunotherapy.', test: 'Immunohistochemistry', level: 'next' },

    { site: 'Colorectal', marker: 'Mismatch-repair loss / MSI-high', why: 'Screens every tumor for Lynch syndrome and predicts response to immune checkpoint inhibitors.', test: 'Immunohistochemistry · PCR · NGS', level: 'core' },
    { site: 'Colorectal', marker: 'KRAS and NRAS mutation', why: 'Predicts no benefit from anti-EGFR antibodies such as cetuximab.', test: 'NGS · PCR', level: 'next' },
    { site: 'Colorectal', marker: 'BRAF V600E', why: 'Poorer prognosis; with MLH1 loss it indicates a sporadic tumor; targetable in combination.', test: 'PCR · NGS', level: 'next' },
    { site: 'Colorectal', marker: 'HER2 amplification', why: 'Anti-HER2 combinations in RAS wild-type disease.', test: 'Immunohistochemistry · in situ hybridization · NGS', level: 'preview' },

    { site: 'Breast', marker: 'ERBB2 (HER2) amplification', why: 'Anti-HER2 therapy. Immunohistochemistry first; 2+ reflexes to in situ hybridization.', test: 'Immunohistochemistry · in situ hybridization', level: 'core' },
    { site: 'Breast', marker: 'BRCA1, BRCA2 (germline)', why: 'PARP inhibitors, and inherited risk for the family.', test: 'Germline NGS', level: 'core' },
    { site: 'Breast', marker: '21-gene expression score', why: 'Estimates the benefit of chemotherapy in early ER-positive, HER2-negative cancer.', test: 'RT-PCR expression panel', level: 'next' },
    { site: 'Breast', marker: 'PIK3CA, ESR1 mutation', why: 'Select targeted or endocrine agents in advanced ER-positive disease.', test: 'NGS on tissue or plasma', level: 'preview' },

    { site: 'Stomach', marker: 'HER2 amplification', why: 'Adds anti-HER2 therapy in advanced gastric and gastro-oesophageal adenocarcinoma.', test: 'Immunohistochemistry · in situ hybridization', level: 'next' },

    { site: 'Skin', marker: 'BRAF V600E / V600K', why: 'Melanoma: combined BRAF and MEK inhibition.', test: 'PCR · NGS', level: 'core' },
    { site: 'Skin', marker: 'KIT; GNAQ, GNA11', why: 'Site-specific drivers: KIT in acral and mucosal melanoma, GNAQ and GNA11 in uveal melanoma.', test: 'NGS', level: 'next' },

    { site: 'Thyroid', marker: 'BRAF V600E', why: 'Papillary thyroid carcinoma: supports the diagnosis and marks more aggressive behavior.', test: 'PCR · NGS', level: 'core' },
    { site: 'Thyroid', marker: 'RET fusion or mutation', why: 'Fusions in papillary carcinoma, point mutations in medullary carcinoma; RET inhibitors. Germline RET mutation means MEN2.', test: 'NGS', level: 'core' },
    { site: 'Thyroid', marker: 'RAS mutation', why: 'Follicular-patterned tumors; one input to assessing an indeterminate nodule.', test: 'NGS', level: 'next' },

    { site: 'Brain', marker: 'IDH1, IDH2 mutation', why: 'Defines astrocytoma and oligodendroglioma, and carries a better outlook than IDH-wildtype glioblastoma.', test: 'Immunohistochemistry · NGS', level: 'next' },
    { site: 'Brain', marker: '1p/19q codeletion', why: 'Together with an IDH mutation, defines oligodendroglioma.', test: 'FISH · microarray · NGS', level: 'next' },
    { site: 'Brain', marker: 'MGMT promoter methylation', why: 'Predicts benefit from temozolomide in glioblastoma.', test: 'Methylation-specific assay', level: 'next' },

    { site: 'Soft tissue', marker: 'KIT, PDGFRA mutation', why: 'Gastrointestinal stromal tumor: imatinib. PDGFRA D842V is resistant to it.', test: 'NGS · PCR', level: 'next' },
    { site: 'Soft tissue', marker: 'EWSR1::FLI1', why: 'Diagnostic of Ewing sarcoma.', test: 'FISH (break-apart) · RNA sequencing', level: 'next' },
    { site: 'Soft tissue', marker: 'SS18::SSX', why: 'Diagnostic of synovial sarcoma.', test: 'FISH · RNA sequencing', level: 'next' },
    { site: 'Soft tissue', marker: 'MDM2 amplification', why: 'Separates well-differentiated and dedifferentiated liposarcoma from benign fatty tumors.', test: 'FISH', level: 'next' },
    { site: 'Soft tissue', marker: 'MYCN amplification', why: 'Neuroblastoma: marks high-risk disease.', test: 'FISH', level: 'next' },

    { site: 'Gynecologic', marker: 'High-risk HPV', why: 'Cervical screening and triage; types 16 and 18 carry the highest risk.', test: 'DNA or RNA amplification', level: 'core' },
    { site: 'Gynecologic', marker: 'POLE, mismatch repair, p53', why: 'The molecular classes of endometrial carcinoma, each with a different outlook.', test: 'NGS · immunohistochemistry', level: 'next' },
    { site: 'Gynecologic', marker: 'BRCA1/2, homologous-recombination deficiency', why: 'High-grade serous ovarian carcinoma: PARP inhibitors.', test: 'NGS', level: 'next' },

    { site: 'Head and neck', marker: 'HPV (p16 as a surrogate)', why: 'HPV-associated oropharyngeal carcinoma has a better prognosis and is staged separately.', test: 'p16 immunohistochemistry · HPV in situ hybridization', level: 'core' },

    { site: 'Urologic', marker: 'VHL loss', why: 'Clear cell renal cell carcinoma; inherited when the mutation is germline.', test: 'NGS', level: 'next' },
    { site: 'Urologic', marker: 'BRCA2 and related repair genes', why: 'Metastatic prostate cancer: PARP inhibitors.', test: 'NGS, tumor and germline', level: 'preview' },
    { site: 'Urologic', marker: 'FGFR3 alteration', why: 'Urothelial carcinoma: an FGFR inhibitor.', test: 'NGS · PCR', level: 'preview' },

    { site: 'Any site', marker: 'MSI-high / mismatch-repair deficient', why: 'Immune checkpoint inhibitors, whatever the tumor type.', test: 'Immunohistochemistry · PCR · NGS', level: 'preview' },
    { site: 'Any site', marker: 'NTRK fusion', why: 'TRK inhibitors such as larotrectinib, whatever the tumor type.', test: 'RNA sequencing', level: 'preview' },
    { site: 'Any site', marker: 'High tumor mutational burden', why: 'Ten or more mutations per megabase can qualify a tumor for a checkpoint inhibitor.', test: 'NGS', level: 'preview' }
  ];
})(window.MP);
