# AIEngg Tutor Evals Lab

**Try the packaged tutor v0 → create evals with an SME → find failures → build v1 → measure improvement.**

Use the repo directly in Claude, Codex or your IDE. No browser, student OpenAI key or npm install is required. Helpers need Node 22+.

**Public API: [https://aiengg-evals-lab.gkcs.chatgpt.site](https://aiengg-evals-lab.gkcs.chatgpt.site)**. Already configured in [config/classroom.json](config/classroom.json).

## Start

```bash
git clone https://github.com/coding-parrot/aiengg-evals-lab.git
cd aiengg-evals-lab
node tools/lab.mjs connect
node tools/lab.mjs doctor
node tools/lab.mjs ask "What is RAG?"
```

Enter the instructor's shared student key once in the hidden prompt. It stays in a Git-ignored local connection file. The assistant can use `connect --key-file PATH` instead. Provider credentials remain on the backend.

Paste into your assistant:

> Read AGENTS.md and START-HERE.md. Begin checkpoint 0 with the packaged tutor v0 and the configured public endpoint. Connect using the shared student key if needed. Run three tutor questions and show their actual saved traces. Do not build a new bot, improve its prompt, add guardrails or run evals yet. Pause before checkpoint 1.

## Query-first lesson

No profile/persona setup. Each case centers on **query → source material → expected answer → actual answer → eval results**. Preserve original query timestamps and provenance.

**Both generation skills ask questions first and wait for your answers.** Golden-set creation asks about count, topics, sources, eval criteria and expected answers. Synthetic expansion separately asks about seeds, count, variation mix, boundaries and changed expectations. Defaults are suggestions; explicitly reply “use all proposed defaults” to accept them. Neither skill silently generates from configuration alone.

| Stage | Trigger file | Inspect |
|---|---|---|
| 0 · Try v0 | [START-HERE.md](START-HERE.md) | Three real answers and traces |
| 1 · SME creates evals | [build-golden-set](skills/build-golden-set/SKILL.md) | 20 tutor queries, checked source links, SME references |
| 2 · Calibrate judges | [calibrate-judges](skills/calibrate-judges/SKILL.md) | Labels, disagreements and held-out agreement |
| 3 · Expand | [expand-eval-data](skills/expand-eval-data/SKILL.md) | 200 additional variants and product matrix |
| 4 · Benchmark v0 | [run-benchmark](skills/run-benchmark/SKILL.md) | Actual scores on 220 cases |
| 4a · Error coding | [analyze-errors](skills/analyze-errors/SKILL.md) | Ranked error histogram, focus areas, optional spider chart |
| 5 · Build v1 | [before-after](references/before-after.md) | Citation guardrail, targeted changes, paired scores and regressions |
| 6 · Monitor | [monitor-production](skills/monitor-production/SKILL.md) | LangSmith traces, alert drill, production retention |

**v0 has no automatic evals or source/citation enforcement.** The SME defines those requirements during eval creation. Measure unchanged v0, then add the guardrail in v1 during the lesson. Evals measure application behavior; they do not improve the model by themselves.

## Data included

- [1,153 sanitized tutor query candidates](datasets/real-world/slack/ai-tutor.json), also in [CSV](datasets/real-world/slack/ai-tutor.csv) and [JSONL](datasets/real-world/slack/ai-tutor.jsonl), with exact timestamps and stable query IDs.
- [20 real tutor seeds](samples/golden-set.draft.csv) and [200 parameterized variants](samples/synthetic-queries.draft.csv), combined in [benchmark.draft.json](samples/benchmark.draft.json).
- [18 educational source snapshots](samples/sanitized-source-cards.json), linking directly to papers and official resources checked on 22 November 2026.
- [Dataset provenance and limitations](datasets/real-world/README.md). Hidden discussions can be added later with the [read-only import skill](skills/import-discussions/SKILL.md).

Candidate labels require review. The expected answers are **assistant drafts, not SME labels**. Existing discussion replies are not ground truth. Source snapshots are short teaching paraphrases; original private lecture links were redacted, so these are independently curated references.

The active pack excludes operational requests, mixed-route cases, known AI answers and non-query record kinds. It contains no profile files or persona fields. This is a new tutor baseline; old domain scores are not comparable.

## Evaluation contract

Answer relevance, context relevance, faithfulness, direct citations and citation support, polite tone, at most 20 sentences, latency and cost. Storyflow is scored when applicable; image quality requires an actual image and a vision judge or SME. **Retention is monitored in production, never graded per query.**

Every approved tutor seed needs educational evidence. Citations must be well-formed links to the specific resource, not bare IDs or source:// placeholders. Code checks URL shape and evidence mapping; resource review checks access/content; semantic judging checks claim support. See [eval-spec.md](references/eval-spec.md).

The shared backend uses the instructor's existing OpenAI key for generation and typed Decisions judging. Do not describe that API as a verified encoder-only architecture. LangSmith credentials are instructor-only at the monitoring stage. See [live service](references/live-service.md), [hosting](hosting/README.md), [helper contracts](references/tool-contract.md) and [v0 manifest](config/v0-manifest.json).

Keep model, sources, dataset and judges fixed for the paired experiment. Pause after each checkpoint and report real failures and unavailable measurements.
