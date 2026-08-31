# JAMB Core Science Prep

A self-contained, multi-subject multiple-choice quiz app for JAMB revision — Mathematics, English, Chemistry, and Biology. No build step, no backend, no dependencies.

**[Live demo](#)** *(add your deployed link here once hosted)*

## Features

- **JAMB-style questions** across four core subjects
- **Topic filtering** within a subject's question set
- **Question navigator** — a grid of numbered boxes to jump to any question directly; shows answered vs. unanswered at a glance
- **Instant feedback** — see the correct answer and a worked explanation as soon as you select an option
- **Score breakdown** — per-topic score summary at the end of each attempt
- **Persistent history** — past attempts are saved in the browser (`localStorage`) and survive reloads
- **Reset control** — clear all saved progress and history with one click

## Project structure

```
jamb-prep/
├── index.html              # app shell — markup, styles, quiz logic
└── questions/
    ├── chemistry.js        # Chemistry question bank
    ├── mathematics.js      # Mathematics question bank
    ├── english.js           # English Language question bank
    └── biology.js           # Biology question bank
```

Each subject's questions live in their own file under `questions/` and are loaded as plain `<script>` tags in `index.html`, then merged into one array at runtime. This keeps subjects easy to add to independently — no build tooling needed.

**Current status:** Chemistry has a full question bank (Stoichiometry, Gas Laws, Kinetic Theory of Matter). Mathematics, English, and Biology are scaffolded but empty — see [Contributing](#contributing) below.

## Usage

Open `index.html` directly in a browser — no server required.

To deploy:

- **GitHub Pages** — enable Pages on this repo (Settings → Pages → deploy from branch); the app will be served as-is
- **Netlify / Vercel** — connect the repo or drag-and-drop the folder

No build step is required for any of these.

## Contributing

The easiest way to grow this: add questions to the relevant file in `questions/`.

Each question follows this shape:

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

To add a new subject entirely:

1. Create `questions/<subject>.js` following the pattern in the existing files (declare a `const <SUBJECT>_QUESTIONS = [...]`)
2. Add a `<script src="questions/<subject>.js"></script>` tag in `index.html`
3. Spread it into the combined `QUESTIONS` array alongside the others

Aim for questions that carry the tone, phrasing, and difficulty of real JAMB questions — not just any MCQ.

## Notes

- Score history is stored per-browser via `localStorage` (key: `chem-quiz-history-v1`), not in a database — it won't sync across devices.
- No tracking, no external requests, no build tooling.

## License

Personal/educational use.
