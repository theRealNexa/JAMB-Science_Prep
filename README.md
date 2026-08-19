# JAMB Core Science Prep

A self-contained, multi-subject practice app for JAMB revision — Mathematics, English, Chemistry, and Biology. No build step, no backend, no dependencies. Open to contributions from anyone.

**[Live demo](https://jambcbtprep.vercel.app/)**

## Features

- **JAMB-style questions** across four core subjects
- **Two study modes:**
  - **Study mode** — self-paced, with the correct answer and a worked explanation shown right after each question
  - **Timed mode** — a random subset of questions pulled from the bank, one countdown for the whole set, answers withheld until the end, followed by a full review of every question you missed
- **Topic filtering** within a subject's question set
- **Question navigator** — a grid of numbered boxes to jump to any question directly; shows answered vs. unanswered at a glance
- **Bookmarks** — flag any question to revisit later, manually managed
- **Missed-question review** — questions missed in Timed mode are saved for later review, with per-question delete and a clear-all option
- **Daily streak** — tracks consecutive days of practice
- **Need-to-Know glossary tab** — root words, prefixes, and quick facts by subject (e.g. *olfactory* → smell-related; *malaria is caused by Plasmodium, transmitted by the female Anopheles mosquito*)
- **Persistent progress** — history, streaks, and bookmarks are all saved in the browser (`localStorage`) and survive reloads
- **Reset control** — clear all saved progress in one click

## Project structure

```
JAMB-Science_Prep/
├── index.html
├── app.js
├── questions/
│   ├── chemistry.js     (full question bank)
│   ├── mathematics.js   (scaffolded, open for contributions)
│   ├── english.js       (scaffolded, open for contributions)
│   └── biology.js       (scaffolded, open for contributions)
└── glossary/
    └── biology.js       (root words + quick facts)
```

Each subject's questions live in their own file under `questions/`, loaded as plain `<script>` tags in `index.html` and merged into one array at runtime. No build tooling needed — this keeps the barrier to contributing as low as possible.

**Current status:** Chemistry has a full question bank (Stoichiometry, Gas Laws, Kinetic Theory of Matter). Mathematics, English, and Biology question banks are open and waiting for contributions. The glossary currently covers Biology only — other subjects welcome.

## Usage

Open `index.html` directly in a browser — no server required.

To deploy:

- **GitHub Pages** — enable Pages on this repo (Settings → Pages → deploy from branch); served as-is
- **Netlify / Vercel** — connect the repo or drag-and-drop the folder

No build step is required for any of these.

## Contributing

Contributions are welcome and encouraged — this project grows through community-added questions and reference material.

**The easiest way to contribute: add questions to an existing subject file** in `questions/`. Each question follows this shape:

```js
{
  subject: "Mathematics",       // must match the subject this file represents
  topic: "Quadratic Equations", // sub-topic within the subject, used for filtering
  q: "Question text here...",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correct: 1,                   // index (0-based) of the correct option
  explain: "Worked explanation shown after answering."
}
```

Aim for questions that carry the tone, phrasing, and difficulty of real JAMB questions — not just any MCQ.

**To add a new subject entirely:**

1. Create `questions/<subject>.js`, declaring a `const <SUBJECT>_QUESTIONS = [...]` array following the pattern in existing files
2. Add a `<script src="questions/<subject>.js"></script>` tag in `index.html`
3. Spread it into the combined `ALL_QUESTIONS` array in `app.js`

**To contribute glossary content** (root words, prefixes, or quick facts) for a subject:

1. Create or edit `glossary/<subject>.js` following the pattern in `glossary/biology.js`
2. Register it in the `GLOSSARY_SUBJECTS` object in `app.js`

**How to submit:**

1. Fork the repo
2. Create a branch for your change
3. Open a pull request describing what you added

Bug reports and feature suggestions are just as welcome via [Issues](https://github.com/theRealNexa/JAMB-Science_Prep/issues).

## Notes

- All progress (history, streaks, bookmarks, missed questions) is stored per-browser via `localStorage`, not in a database — it won't sync across devices.
- No tracking, no external requests, no build tooling.

## License

MIT — see [LICENSE](./LICENSE). Free to use, modify, and distribute, including commercially, with attribution.
