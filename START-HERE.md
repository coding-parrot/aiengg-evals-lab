# AIEngg: from a convincing demo to a measured support agent

This is a prompt-driven lab for your coding assistant. Open this folder in your preferred IDE, Codex or Claude and give the prompts below. The assistant builds and runs the implementation; learners inspect the evidence and make product decisions. No notebook or manual coding exercise is required.

## Start the lab

> Read `START-HERE.md`, `references/lab-contract.md` and `references/tool-contract.md`. Act as my lab partner. Build the initial AIEngg customer support bot using the existing project's stack; use TypeScript if this is a new project. Load `prompts/support-starting-system.txt` verbatim as the system prompt, without extra evaluation rules. Use the available model connection. Ask only for missing credentials or source access, without asking me to paste secrets into chat. Start with a simple retrieval-and-answer flow and no eval suite. Keep instrumentation so we can later inspect retrieved context, tool calls, citations, latency and cost. Do not read reference answers into the bot. Save the starting prompt hash, model settings and source snapshot. Show me the bot and let me try three questions. Stop at checkpoint 0; wait for my next trigger.

**Starting bot (`v0`)** means this saved initial application. **Improved bot (`v1`)** means a later application version changed in response to observed eval failures. Evals measure improvement; they do not improve the model on their own. Follow `references/before-after.md` for the paired experiment.

Then trigger each stage separately. You can mention the file by path even if your assistant has no skill-installation feature.

| Stage | Prompt to your assistant | File to show the class |
|---|---|---|
| 0 · Looks good? | Start prompt above | Bot UI; three actual responses |
| 1 · Define good | Read `skills/build-golden-set/SKILL.md` and create our golden set. Use the saved intake defaults. | `artifacts/golden-set.csv`; `artifacts/coverage.csv` |
| 2 · Grade the grader | Read `skills/calibrate-judges/SKILL.md` and calibrate each judge against SME ratings of bot outputs. | `artifacts/judge-labels.csv`; `artifacts/judge-disagreements.csv`; `artifacts/calibration-report.html` |
| 3 · Expand the test | Read `skills/expand-eval-data/SKILL.md` and generate 200 additional cases from our 20 approved seeds. | `artifacts/synthetic-queries.csv`; `artifacts/product-matrix.csv` |
| 4 · Set the baseline | Read `skills/run-benchmark/SKILL.md` and benchmark the frozen v0 on all 220 cases. | `artifacts/baseline-scorecard.html`; `artifacts/eval-results.csv` |
| 5 · Make a measured change | Read `references/before-after.md`. Fix an observed prompt-related failure, save the improved bot, and rerun with the same model, evidence fixtures and judges. | `artifacts/comparison.html`; prompt diff; paired answers; regressions |
| 6 · Close the loop | Read `skills/monitor-production/SKILL.md` and prepare a LangSmith-instrumented staging deployment and alert drill. | `artifacts/monitoring-plan.json`; live traces when connected; alert evidence |

Do not run every stage at once. The pauses are the lesson: the instructor opens each result before moving on. A skill completes the current stage's authorized work and records any genuine missing dependency; it must not invent scores to fill a checkpoint.

## Files already prepared

- `intake.html`: local SME intake form; profiles, goals, 20-seed default, eval choices, custom queries. Exports JSON for the assistant.
- `prompts/support-starting-system.txt`: the exact default prompt for the starting bot. Preserve it until the baseline is measured.
- `references/before-after.md`: how to demonstrate a measured improvement without changing the test or grader.
- `samples/golden-set.draft.csv`: 20 sanitized queries reconstructed from actual Slack support/issue reports. All references are **assistant drafts awaiting SME review**.
- `samples/synthetic-queries.draft.csv`: 200 variants with parent IDs, transformations, scenario parameters and review flags.
- `samples/benchmark.draft.csv`: the combined 220 rows. This is a draft dataset, not an executed benchmark.
- `samples/sanitized-source-cards.json`: source dates and sanitized evidence, with classroom citation IDs. The private link register is a separate instructor deliverable, excluded from this kit.
- `samples/review.xlsx`: readable review copy of the draft seed set.
- `references/eval-spec.md`: the exact metrics, rubrics, denominators and applicability rules.
- `references/facilitator-guide.md`: timing, reveal sequence, questions and exercises.
- `references/langsmith-runbook.md`: native Jev setup, tracing, feedback, monitoring and alerts.
- `tools/checks.mjs`: runnable deterministic citation, sentence, latency and cost checks; the assistant invokes these.
- `references/tool-contract.md`: how the assistant runs real Jev calls, threshold calibration and an HTTP bot benchmark with the included helpers.

## What is ready and what is intentionally still a human decision

The lesson pack, draft data and deterministic checks are ready to review. No bot has been deployed, no real AI judge has scored these cases, and no SME has approved the references. Your assistant produces those artifacts as you run the lab with your model credentials and approved knowledge sources.

The sample searched the requested two-year window, 22 November 2024–22 November 2026. Its selected evidence is from 2025–2026. It is a curated teaching set, not an exhaustive or statistically representative export of all support traffic. GitHub remains an available source adapter; the connected repository searched for this sample returned no matching issues in this window.

Share this kit with the cohort. Keep the separate instructor source register and SME identities within the instructor's authorized workspace. Classroom source IDs point to the sanitized evidence, not internal systems. These historical source cards teach evaluation and are not approved production policies.
