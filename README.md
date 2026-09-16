# SRCwL Archive

A reading collection for I609 (Sustainability, Resilience, and Computing within Limits) at Indiana University. This is a GitHub Pages site for sharing academic papers with structured summaries, annotations, and cross-references.

**Live site:** https://aprumm01.github.io/srcwl-archive/

---

## Adding New Papers

### 1. Place the PDF in the papers folder
```
papers/<filename>.pdf
```
PDFs are gitignored and won't be committed.

### 2. Create a study-partner summary

Use the **study-partner skill** to create a structured summary. The skill is located at:
```
~/.claude/skills/study-partner/study-partner+instructions.md
```

The summary should follow this format (all sections required):

1. **Overview of the Document** (min 250 words) — Authors, affiliations, expertise, document type, field, significance
2. **Research Overview** (min 250 words) — Central research question, methods, key concepts with at least one direct quote + APA citation
3. **Theories of Knowledge** (min 200 words) — Theoretical frameworks with definitions and citations
4. **Central Arguments** (min 300 words) — Main argument with direct quotes, sub-claims
5. **Evidence** (min 400 words) — Supporting evidence, methodological limitations
6. **Conclusion** (min 300 words) — Synthesis for recall 6 months later
7. **APA Citation** — Correctly formatted
8. **Discussion Questions** — 4 questions for seminar
9. **Bias Check** — Neutrality reflection, accuracy score 1-10

Save the summary as:
```
papers/<author>-<year>-<topic>-summary.md
```

### 3. Create an annotation

Use the **annotated-bib skill** to create a 150-200 word evaluative annotation following Cornell University Library guidelines. The skill is located at:
```
~/.claude/skills/annotated-bib/
```

The annotation should:
- Identify authors and their credentials
- Summarize the main argument
- Evaluate methodology and evidence
- Explain relevance to the research topic (AI and sustainability)
- Identify intended audience

### 4. Add the paper to papers.json

Add a new entry to `data/papers.json` in the `papers` array:

```json
{
  "id": "author-year-topic",
  "citation": {
    "authors": ["Last, F.", "Last2, F."],
    "year": 2024,
    "title": "Paper Title",
    "venue": "Journal or Conference Name",
    "volume": "10",
    "issue": "2",
    "pages": "1-15",
    "doi": "10.xxxx/xxxxx"
  },
  "themes": ["design-futures", "physical-grounding"],
  "methods": ["theoretical", "review"],
  "summaryFile": "papers/author-year-topic-summary.md",
  "annotation": "The 150-200 word annotation text goes here...",
  "summary": {
    "documentOverview": "...",
    "researchOverview": "...",
    "theoriesOfKnowledge": "...",
    "centralArguments": "...",
    "evidence": "...",
    "conclusion": "..."
  },
  "discussionQuestions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?"
  ],
  "crossReferences": ["other-paper-id"]
}
```

### 5. Add glossary terms (optional)

If the paper introduces key concepts, add them to the `glossary` array in `papers.json`:

```json
{
  "term": "Term Name",
  "definition": "Clear definition of the term...",
  "papers": ["paper-id-1", "paper-id-2"]
}
```

### 6. Update cross-references

Add the new paper's ID to the `crossReferences` array of related papers, and add related paper IDs to the new paper's `crossReferences`.

---

## Available Themes

| ID | Name | Color |
|----|------|-------|
| `design-futures` | Design for Futures | Purple `#D4A7E8` |
| `physical-grounding` | Physical Grounding | Blue `#A7C4E8` |
| `measurement-boundaries` | Measurement Boundaries | Amber `#E8B87D` |
| `cost-relocation` | Cost Relocation | Green `#7DD3A7` |

## Available Methods

| ID | Name |
|----|------|
| `empirical` | Empirical Study |
| `survey` | Survey |
| `review` | Review/Position |
| `modeling` | Modeling |
| `repository-mining` | Repository Mining |
| `theoretical` | Theoretical Framework |
| `design` | Design Research |

---

## Project Structure

```
SRCwL Archive/
├── index.html          # Main page
├── styles.css          # All styling (dark mode, WCAG AA compliant)
├── app.js              # Application logic
├── data/
│   └── papers.json     # All paper data, themes, methods, glossary
├── papers/
│   ├── *.pdf           # Source PDFs (gitignored)
│   └── *-summary.md    # Study-partner summaries
└── README.md           # This file
```

---

## Batch Processing Multiple Papers

To process multiple papers at once, spawn parallel agents:

```
fan out agents to create summaries for each new paper in the papers folder
(use the study-partner skill) and then add them to the archive page
```

This will:
1. Read each PDF
2. Create study-partner summaries in parallel
3. Add all papers to papers.json with annotations and cross-references

---

## Design System

### Colors
- **Background:** `#0F1114`
- **Surface:** `#171A1E`
- **Accent (amber):** `#E8B87D`
- **Link (blue):** `#A7C4E8`
- **Text:** `#F0F2F4`
- **Text secondary:** `#B8BFC7`
- **Text muted:** `#8A929C`

### Typography
- **Serif (display):** Fraunces
- **Sans (body):** Inter
- **Mono:** JetBrains Mono

### Contrast
All text meets WCAG AA standards (4.5:1 minimum for body text).

---

## Deployment

The site deploys automatically to GitHub Pages when you push to main:

```bash
git add -A
git commit -m "Add new paper: Author (Year) Title"
git push
```

---

## Skills Reference

### study-partner
**Location:** `~/.claude/skills/study-partner/study-partner+instructions.md`

Creates comprehensive academic summaries with:
- Document overview
- Research overview with direct quotes
- Theoretical frameworks
- Central arguments
- Evidence analysis
- Synthesis conclusion
- APA citation
- Discussion questions
- Bias check

### annotated-bib
**Location:** `~/.claude/skills/annotated-bib/`

Creates 150-200 word evaluative annotations following Cornell University Library guidelines for annotated bibliographies.
