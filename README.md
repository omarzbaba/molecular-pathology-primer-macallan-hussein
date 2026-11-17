# Molecular Pathology — A Primer for the Pathology Rotation

An interactive teaching primer that takes a medical student from *"I have heard of PCR"* to choosing a molecular test, protecting the specimen for it, and reading the report that comes back.

Built for **Macallan & Hussein**. It is designed to be taught in **one sitting of about 90 minutes**, with everything else kept clearly apart as optional material to open later.

**Live site:** https://omarzbaba.github.io/molecular-pathology-primer-macallan-hussein/

© 2026 **Omar Z. Baba, MD**. All rights reserved. See [LICENSE](LICENSE).

---

## How it is organised

**The session — eight stops, about 90 minutes.** Each stop has one idea, one thing to try, a short list to carry away, and one checkpoint question.

| Stop | Objective | Minutes |
|---|---|---|
| Start here | The one idea: complementary strands find each other | 5 |
| 1 · Read the language | Trace a gene to its protein, name the six kinds of alteration, read a variant name | 12 |
| 2 · Protect the specimen | Choose the tube and fixative, avoid acid decalcification, estimate tumor cellularity | 8 |
| 3 · Amplify | Explain PCR, reverse transcription and real-time PCR; read a Ct value | 10 |
| 4 · Sequence | Compare Sanger with NGS; use depth, allele fraction and limit of detection | 10 |
| 5 · Chromosomes | Match karyotype, FISH, microarray and sequencing to the lesion each can detect | 10 |
| 6 · Interpret | Germline versus somatic, the tier languages, uncertainty, what a negative means | 10 |
| 7 · In cancer | Link nine core results to the action each one triggers | 10 |
| 8 · Beyond cancer | Inherited disease, drug response, infection, and the rules of consent | 7 |
| Wrap-up | Two cases worked together; ten things to keep | 8 |

Skipping the activities marked *if time allows* brings it to about an hour. A session clock in the header shows elapsed time against the plan.

**On your own — supplementary.** Dashed *Go deeper* drawers inside each stop, plus a library below the session:

- **Case lab** — six more cases, revealed one decision at a time.
- **Question bank** — 30 questions filterable by objective, each with the answer, the reasoning, why the other options fail, and a pearl.
- **Biomarker atlas** — 41 tumor–biomarker pairs, searchable and filterable by site.
- **Reference tables** — blood cancers, inherited diseases, cancer syndromes, pharmacogenes, infections, quality and law.
- **Glossary** — 52 plain-language terms; the core vocabulary is marked.

How the objectives were derived from the American Board of Pathology content specifications is laid out in [PLANNING.md](PLANNING.md). Every item carries a level flag: **Core**, **Next level**, or **Preview**.

---

## The interactives

All of them are built in code — no images, no pre-rendered video.

| Lab | What it teaches |
|---|---|
| Live 3D double helix | Raise the temperature: A–T pairs open first, then the strands separate. The trick behind nearly every test. |
| Mutation lab | The real *BRAF* sequence around codon 600. Change a base and watch the protein change and the variant name write itself. |
| Tumor cellularity estimator | Estimate tumor nuclei in a field, then see what that does to the expected allele fraction. |
| PCR cycler | Denature, anneal, extend — and the copies double. |
| Real-time PCR explorer | Starting quantity against Ct; 3.3 cycles per ten-fold. |
| Read pileup | Depth, purity and allele fraction, and why low-level variants are missed. |
| Which test can see it? | Technologies on a size ruler against eight kinds of lesion. |
| FISH simulator | Break-apart, dual-fusion, amplification and deletion patterns, with a call-the-nucleus round. |
| Annotated report | The eight parts of a tumor sequencing report. |
| Mismatch-repair board | Four immunostains, the pairing logic, and the next step. |
| Chromatogram reader *(supplementary)* | Calling a heterozygous variant, and Sanger's limit of detection. |
| Repeat ruler *(supplementary)* | Normal, premutation and full-mutation ranges. |

Four short public videos are offered in the drawers and load only when clicked: PCR and Sanger sequencing (Cold Spring Harbor Laboratory DNA Learning Center), sequencing by synthesis (Illumina), and FISH (Emory University CancerQuest).

---

## Run it locally

A static site with no build step.

```bash
python3 -m http.server 8124
```

Then open http://localhost:8124. (Opening `index.html` straight from disk also works, apart from the 3D helix, which browsers only load over http.)

---

## File structure

```
.
├── index.html            the page: session stops, drawers, library
├── css/
│   ├── base.css          design tokens (light and dark), shell, typography
│   ├── components.css    cards, tables, quiz, cases, atlas, glossary, search
│   └── labs.css          session structure and every interactive
├── js/
│   ├── core.js           helpers, per-learner progress store, lab frame and controls
│   ├── widgets.js        agenda, objective map, tables, glossary, atlas, videos
│   ├── practice.js       questions, cases, learner switcher, progress
│   ├── app.js            theme, navigation, session clock, search
│   ├── data/             the content: stops, take-aways, questions, cases, glossary, atlas, tables
│   └── labs/             one file per interactive
├── PLANNING.md           how the objectives were derived, and the session design
├── LICENSE
└── README.md
```

Content lives in `js/data/` as plain data, separate from the code that renders it, so a question or a table row can be corrected without touching the engine.

### Updating the content

1. Edit the text — almost always a file in `js/data/`.
2. In `index.html`, change the version stamp on the stylesheet and script links (find `?v=` and replace the value everywhere). Browsers keep these files for several minutes; a new stamp makes them fetch the new ones at once.
3. Commit and push. GitHub Pages redeploys in about a minute.

### Customizing for a different group of learners

Each group gets its own repository; never edit a published one in place.

1. In `js/core.js`, change `LEARNERS` and give `STORE_KEY` a value no other primer uses. Every repository under the same GitHub Pages account shares one browser origin, so two primers with the same key would overwrite each other's saved answers.
2. Replace the names in `index.html` (the page description, the welcome line, the closing card and the footer), in this README and in `PLANNING.md`.
3. Bump the `?v=` stamp as above, commit, and publish to a new repository.

---

## Libraries

- **three.js** (r186), for the 3D helix only. It is loaded from a public CDN at run time; if it cannot load, a static figure takes its place and the rest of the page is unaffected.
- **Nothing else.** No framework, no bundler, no web fonts. Everything is plain HTML, CSS and JavaScript on the system font stack.

---

## Design notes

- **Restrained and near-monochrome**, one blue accent, hairline surfaces, true-black dark theme. Light and dark both follow the system setting and can be switched in the header.
- **Colour carries data, never decoration.** The four bases use one palette throughout (A green, C blue, T orange, G ink), checked for colour-vision-deficiency separation in both themes. Text never wears a data colour.
- **Progress is per learner.** Choose a name under *Studying as* and answers are kept for that person on that device (browser storage only — nothing is sent anywhere). Labs a learner has worked through are marked *explored*.
- **Honest questions.** Answer options appear in a fixed shuffled order and are written to similar length, so the key cannot be guessed from position or wording.
- **Accessible:** semantic HTML, keyboard operable, visible focus, `prefers-reduced-motion` respected, charts paired with a table view.
- **Search:** press `⌘K`, `Ctrl K` or `/`.

---

## A note on accuracy

This is an educational synthesis for medical-student teaching. It is **not** a clinical protocol and contains **no fabricated citations**. Drug names are examples, not recommendations. For authoritative detail, consult the bodies named in [PLANNING.md](PLANNING.md) and your laboratory's own validated procedures before acting on a patient.

---

## Copyright

**© 2026 Omar Z. Baba, MD. All rights reserved.**

The curriculum, written content, question bank, cases, glossary, interactive labs, design system and source code of this primer — and their selection and arrangement as a compilation — are the original work of the copyright holder and may not be reproduced, redistributed or adapted without written permission. Reading the published site is permitted; copying, re-hosting or adapting it is not.

Full terms are in [LICENSE](LICENSE). The embedded videos remain the property of their publishers. This work is not affiliated with or endorsed by the American Board of Pathology.
