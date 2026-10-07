# Powtórka — CPU

A responsive Polish study app for desktop and mobile. Open `index.html` locally or use the GitHub Pages website linked in this repository.

## Use on your phone

Open the website in Safari or Chrome. You can add it to your home screen through the browser menu. There is no account or installation required. Progress is saved on the current device and browser; it does not sync between your phone and computer.

## Features

- Quick test: 10 random questions; long test: 40.
- 904 questions with author names from the original filenames. Repeated formulations are retained as separate source records.
- Four shuffled options per question, one correct answer.
- Closely related technical distractors revised for 748 questions; original correct answers are unchanged.
- **Dziwne pytania:** 10 random flashcards from the 134 disputed source records. Reveal the original answer and the editorial explanation, resume later, and review all ten at the end. No accuracy score is assigned to unreliable answers.
- Resume a test, review mistakes, view scores and history.
- Search and filter the question bank, mark questions for revision.
- 134 ambiguous source records are preserved separately and excluded from scoring.
- Dark responsive interface, keyboard controls, no external runtime dependencies.

## Run locally

Open `index.html` or double-click `START.cmd` on Windows. Alternatively, with Node.js 18 or later:

```
node server.cjs
```

Then open http://127.0.0.1:4173.

## Question database

`data/questions.json` contains the questions and original text records with source references. After editing it, run:

```
node scripts/build-data.cjs
node --test tests/core.test.cjs
```

Keep existing question IDs stable to preserve saved history. The browser copy is `data/questions.js`.

Editorial distractors are maintained in `data/distractors-v3.txt` (concept plus three pipe-separated alternatives). Run `node scripts/refine-distractors.cjs` to apply them and rebuild the browser database. New attempts snapshot their answer options so later edits do not alter their review text. Existing attempts retain the previous alternatives; start a new test to see the revised options.

The 26 supplied study documents yielded 1,038 records. Answers come from those materials; incorrect options were authored separately. Original Office/PDF binaries and development screenshots are not required to run the app and are not included here.

## GitHub Pages

The site is plain static HTML/CSS/JavaScript with relative asset URLs. Publish from `main`, `/ (root)` in repository Settings → Pages. No build step or secrets are required. `.nojekyll` disables Jekyll processing.
