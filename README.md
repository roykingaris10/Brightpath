# GRC Grind

A career simulator that trains a UK cyber GRC analyst by making them do the job — realistic
artefacts, realistic stakeholders, performance-based progression.

**Phase 1** ships Tier 1 (Brightpath Learning, a Shoreditch edtech startup chasing its first
ISO/IEC 27001:2022 certificate): the app shell, save/export-import, graded morning triage, and
three fully working task types — risk write-up, supplier assessment and multi-beat incident
decision — with four-dimension grading and an end-of-day manager debrief.

## Build

`index.html` is the deliverable: one self-contained file, no build step needed to run it.
It is generated from the parts in `src/`:

```sh
./build.sh      # concatenates src/* into index.html
```

| file | what's in it |
|---|---|
| `src/00-head.html` | title, fonts, design tokens, all CSS |
| `src/10-world.js` | skill tree, dimensions, the Brightpath company bible |
| `src/20-artefacts.js` | renderers for emails, threads, questionnaires, certificates |
| `src/22-risk.js` · `24-supplier.js` · `26-incident.js` | the scenario bank, with hidden rubrics |
| `src/30-days.js` | day plans and the morning inboxes |
| `src/40-grade.js` | four-dimension grading: AI grader + offline rubric grader |
| `src/50-engine.js` | state, saves, capabilities, the working day |
| `src/60-ui.js` · `70-boot.js` | rendering and the controller |

## Grading

Every free-text answer is scored 0–5 on technical accuracy, judgement, communication and
professional craft. When the page can reach Claude (the `sample` capability) it is graded in
character by the player's manager against a hidden brief. Where it cannot, a built-in rubric
grader scores the same four dimensions from the scenario's checks, so the game works offline.

Deterministic facts — risk score bands, owner choice, supplier tier, the notification decision —
are always resolved locally and the AI grade cannot overrule them.

## Saves

Saved to the artifact's `db` where available, mirrored to `localStorage`, and always exportable
as JSON from **Save & settings**.

## Tests

Browser tests drive the real page with Playwright (Chromium). They need the
browser available at `/opt/pw-browsers/chromium` or on the default path.

```sh
node test/render-paths.js     # renders every view, phase, task and beat; flags template errors
node test/e2e-day.js          # plays a full working day, including a reload mid-review
node test/e2e-incident.js     # multi-beat incident across reloads
```

`render-paths.js` runs headless against the built JS with a DOM stub; the other
two drive `index.html` in a real browser.
