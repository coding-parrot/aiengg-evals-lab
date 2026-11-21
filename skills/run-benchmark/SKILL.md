---
name: run-benchmark
description: Run and compare versioned support-agent experiments on the frozen original and synthetic query set, using calibrated judges and deterministic checks.
---

# Establish the baseline

Read `../../references/lab-contract.md`, `../../references/eval-spec.md` and the current `judge-config.json`. Confirm the dataset contains 20 originals and 200 synthetic cases, all with review/provenance state. Check family separation and that reference answers cannot reach the bot.

For before/after teaching, also read `../../references/before-after.md`. The Starting bot (`v0`) must use the saved `../../prompts/support-starting-system.txt`; do not change it while adding evaluators. Measure this saved bot once the suite is ready. “No evals yet” is unmeasured, not zero performance. The Improved bot (`v1`) is a separate version created from observed failures. First isolate a prompt change with identical retrieved evidence, model/settings and judges; keep later retrieval/tool changes in separate experiments.

Freeze v0, dataset, retrieval source snapshots, model versions, judge versions, rubrics and budget thresholds. Capture a manifest and unique experiment ID before running. Start with a small smoke run to confirm model access, trace fields, citation mappings and estimated cost; do not spend the full benchmark on a broken harness.

Run all 220 queries with the actual agent. Default to 3 repetitions per query for 660 agent runs when budget permits; a one-pass 220-run teaching mode is acceptable if marked. Judge each actual response and retrieved context, not the query alone or a cached reference. Store generated images for vision evaluation where applicable. Measure streaming TTFT and total latency separately from judge duration. Meter all retries, tool calls and image generation; separate serving cost from evaluation cost.

Use `../../tools/checks.mjs` or equivalent verified checks for tutor-only source citations, sentence count and numeric budgets. Pass the trusted dataset route to the evaluator: support citation presence is not applicable; tutor citations must visibly link to approved resources using well-formed HTTP(S) URLs. Evaluate v0 without adding this guardrail to its runtime; implement it in v1 later. A valid URL is not proof of faithfulness; retain semantic citation-support and claim-support judges. Report judge errors, abstentions and unscored dimensions visibly. Never substitute a keyword mock or illustrative score without labeling the entire run as simulated.

Produce `eval-results.csv` in long form, `baseline-scorecard.html` and per-case traces. Display:

- Original-only, synthetic-only and parent-balanced results.
- Calibration-exposed versus held-out query families.
- Every quality dimension with its applicable denominator, N/A and unavailable counts.
- Latency p50/p95, measured TTFT coverage, cost per run, totals and evaluator overhead.
- Failures by intent, product, source type, transformation and severity.
- Repeated-run instability and the most costly/slowest cases.

The first score is a starting point, not an improvement claim. On the next requested trigger, prioritize a failure cluster by severity, frequency and fixability. Change a controllable component (retrieval, source routing, prompt, tool use or response rendering), save v1 and rerun the same frozen setup. Compare per-case changes and regressions. Do not retune the judge or change weights to make v1 look better. New prompts/sources require separate version metadata.

For the error-analysis checkpoint before selecting a fix, use `../analyze-errors/SKILL.md`. It creates a reviewed/draft coding table, versioned taxonomy, ranked error-frequency chart and optional comparable-metric spider chart. Keep this separate from actually modifying the agent.

If showing confidence intervals, resample original families, not individual synthetic siblings. Report that the small family count limits certainty. Save `comparison.html` and `release-decision.json` with the actual gates and remaining failures. Do not auto-deploy a failed candidate.
