# Tutor v0 to v1: checkpoint prompts

The public endpoint is already configured. Use the repository through Claude, Codex or your IDE. No browser or profile setup.

## 0 · Try the already packaged tutor

> Read AGENTS.md and references/tool-contract.md. Run node tools/lab.mjs doctor. If needed, connect using the shared student key with hidden terminal input or a private key file. Run three tutor questions using node tools/lab.mjs ask and show the actual answers, retrieved resources and saved traces. Do not change v0, add guardrails or run evaluators. Stop here.

Try “What is RAG?”, “How does a query become a search vector?” and “Why does O(1) lookup not solve RAM capacity limits?”

## 1 · SME creates the evals

> Read skills/build-golden-set/SKILL.md. First ask me its intake questions about query count, topics, query sources, educational resources, eval criteria, custom cases and expected-answer authoring. Offer the saved defaults, including 20 queries, and wait for my answers before selecting or generating anything. Then create the golden set using my choices, preserving timestamps and provenance. No profiles/personas. Label drafts honestly and pause for SME reference review.

## 2 · Calibrate the judges

> Read skills/calibrate-judges/SKILL.md. Collect actual tutor answers and SME metric labels. Compare judge decisions, calibrate on calibration families, and show held-out agreement and disagreements. Stop here.

## 3 · Generate 200 additional queries

> Read skills/expand-eval-data/SKILL.md. First ask me which seed version, how many additional queries, which variations/failures, what generation mix, what boundaries and how to handle changed expected answers. Offer 200 additional queries as the default for 20 seeds, and wait for my answers. Then generate using my choices and show the product matrix, variant CSV and changed expectations. Preserve parent families, timestamps and splits.

## 4 · Measure unchanged v0

> Read skills/run-benchmark/SKILL.md. Evaluate the frozen tutor v0 on all 220 reviewed cases using the calibrated judges. Save actual results and unavailable dimensions. Do not modify v0 to improve its score.

## 4a · Analyze errors

> Read skills/analyze-errors/SKILL.md. Code observed failures, build a taxonomy and show a ranked error histogram with examples and recommended focus areas. Add a spider chart only for comparable metric scores. Pause before changing the tutor.

## 5 · Improve to v1

> Read references/before-after.md. Fix an observed failure in a separately saved v1. Add the source/citation guardrail now: checked evidence and direct well-formed resource links. Rerun under the same protocol and report gains and regressions. Label retrieval/runtime changes as whole-agent changes.

## 6 · Monitor production

> Read skills/monitor-production/SKILL.md. Prepare LangSmith tracing, sampled online judges, feedback and a staging alert drill. Track retention over mature user cohorts. Mark proposed configuration separately from verified live monitoring.

Read each SKILL.md directly; global skill installation is optional. Intake can happen in chat. The HTML form is optional. Samples are reviewable drafts, not completed SME calibration or an executed full benchmark.
