# SRCwL Archive

A curated reading collection for I609: Sustainability, Resilience, and Computing within Limits.

## Live Page

[View the archive →](https://YOUR-USERNAME.github.io/srcwl-archive/)

## Features

- **7 papers** on AI sustainability, data center impacts, and technical debt
- **Structured summaries** generated with study-partner skill
- **Annotated bibliographies** following Cornell University Library guidelines (APA 7th)
- **Cross-references** between related papers
- **Theme filtering** by cross-cutting concepts
- **Method filtering** by research approach
- **Discussion questions** for seminar use
- Dark mode, responsive, accessible

## Cross-Cutting Themes

1. **Cost Relocation** — Cost doesn't disappear, it relocates. Efficiency gains in one area surface as costs elsewhere.
2. **Measurement Boundaries** — Every measurement has an invisible boundary, and that's where the real cost hides.
3. **Physical Grounding** — The abstraction of "data" and "the cloud" keeps getting re-grounded in physical constraint.

## Adding Papers

1. Add the PDF to `/papers/` folder
2. Use the `study-partner` skill to generate a structured summary
3. Use the `annotated-bib` skill to generate an annotation
4. Add the paper object to `data/papers.json`
5. Commit and push

## GitHub Pages Deployment

1. Push this folder to a GitHub repository
2. Go to Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main`, folder: `/ (root)`
5. Save and wait for deployment

## Local Development

Just open `index.html` in a browser. No build step required.

For local server (avoids CORS issues with JSON fetch):
```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Structure

```
SRCwL Archive/
├── index.html          # Main page
├── styles.css          # Styles
├── app.js              # Application logic
├── data/
│   └── papers.json     # Paper data (summaries, annotations, cross-refs)
├── papers/             # Raw PDFs (not deployed, just for reference)
└── README.md
```

## Research Topic

AI and sustainability, specifically data storage and the idea of disposable ideations, focused mostly on design, but also product development and software building.

## Course Context

I609 is a design-oriented seminar exploring sustainability, resilience, and computing within limits (SRCwL). The five principles of Sustainable Interaction Design:

1. Linking Invention & Disposal
2. Promoting Renewal & Reuse
3. Promoting Quality & Equality
4. De-coupling Ownership & Identity
5. Using Natural Models & Reflection

---

*Summaries generated with study-partner skill. Annotations follow Cornell University Library guidelines.*
