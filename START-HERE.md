# AIEngg: from a convincing demo to a measured support agent

This is a prompt-driven lab for your coding assistant. Open this folder in your preferred IDE, Codex or Claude and give the prompts below. The v0 bot is already implemented and packaged. The assistant runs the evaluation stages and creates v1; learners inspect evidence and make product decisions. No notebook or manual coding exercise is required.

## Start the lab

The public endpoint is **https://aiengg-evals-lab.gkcs.chatgpt.site**, already set in `config/classroom.json`. Use the terminal through your coding assistant; no browser is required. `node tools/lab.mjs connect` accepts the shared student key once. `doctor` checks connectivity; `ask "QUESTION"` runs the packaged v0 and saves its trace.

> Read AGENTS.md, START-HERE.md and references/tool-contract.md. Begin checkpoint 0 entirely in this repo. Run node tools/lab.mjs doctor. If the shared student key is missing, help me use node tools/lab.mjs connect with hidden terminal input or a private key file. Use the URL already in config/classroom.json. Run the packaged v0 bot for three questions using node tools/lab.mjs ask and show the actual saved traces. Do not create or change the bot, open a browser, ask for an OpenAI key, or run evals yet. We will create v1 from observed failures later.

**Starting bot (`v0`)** means this saved initial application. **Improved bot (`v1`)** means a later application version changed in response to observed eval failures. Evals measure improvement; they do not improve the model on their own. Follow `references/before-after.md` for the paired experiment.

Then trigger each stage separately. You can mention the file by path even if your assistant has no skill-installation feature.

| Stage | Prompt to your assistant | File to show the class |
|---|---|---|
| 0 · Looks good? | Start prompt above | Three actual responses; saved JSON traces |
| 1 · Define good | Read `skills/build-golden-set/SKILL.md` and create our golden set. Use the saved intake defaults. | `artifacts/golden-set.csv`; `artifacts/coverage.csv` |
| 2 · Grade the grader | Read `skills/calibrate-judges/SKILL.md` and calibrate each judge against SME ratings of bot outputs. | `artifacts/judge-labels.csv`; `artifacts/judge-disagreements.csv`; `artifacts/calibration-report.html` |
| 3 · Expand the test | Read `skills/expand-eval-data/SKILL.md` and generate 200 additional cases from our 20 approved seeds. | `artifacts/synthetic-queries.csv`; `artifacts/product-matrix.csv` |
| 4 · Set the baseline | Read `skills/run-benchmark/SKILL.md` and benchmark the frozen v0 on all 220 cases. | `artifacts/baseline-scorecard.html`; `artifacts/eval-results.csv` |
| 4a · Find the failure pattern | Read `skills/analyze-errors/SKILL.md`. Code our observed failures, group them into a taxonomy, and show a ranked error-frequency chart with severity and focus areas. Add a spider chart only for comparable metric scores. | `artifacts/error-analysis/<analysis_id>/error-coding.csv`; `error-taxonomy.json`; `error-analysis.html`; `regression-candidates.csv` |
| 5 · Make a measured change | Read `references/before-after.md`. Fix an observed prompt-related failure, save the improved bot, and rerun with the same model, evidence fixtures and judges. | `artifacts/comparison.html`; prompt diff; paired answers; regressions |
| 6 · Close the loop | Read `skills/monitor-production/SKILL.md` and prepare a LangSmith-instrumented staging deployment and alert drill. | `artifacts/monitoring-plan.json`; live traces when connected; alert evidence |

Do not run every stage at once. The pauses are the lesson: the instructor opens each result before moving on. A skill completes the current stage's authorized work and records any genuine missing dependency; it must not invent scores to fill a checkpoint.

## Files already prepared

- `datasets/real-world/slack/`: all 2,946 collected discussion records, split into 439 customer-support and 2,507 AI-tutor records, with exact UTC timestamps and 1,044 fictional profiles. AI replies and feedback are flagged separately. Read `datasets/real-world/README.md` before selecting queries. The earlier 40-row file remains an optional preview.
- `skills/import-discussions/SKILL.md`: read-only import of all database discussions, including hidden rows, once the private connection file is supplied. See `references/discussion-import.md` for setup.
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
- `references/langsmith-runbook.md`: Decisions worker integration, optional Jev setup, tracing, feedback and alerts.
- `tools/checks.mjs`: runnable deterministic citation, sentence, latency and cost checks; the assistant invokes these.
- `references/tool-contract.md`: how the assistant runs typed OpenAI Decisions calls, threshold calibration and an HTTP bot benchmark with the included helpers.

## What is ready and what is intentionally still a human decision

The lesson pack, packaged v0, draft data and deterministic checks are prepared. The service’s verified status is recorded in `references/live-service.md`. SME approval, calibrated thresholds, full benchmark scores and measured v1 improvements are produced during the checkpoints; they are not prefilled.

The sample searched the requested two-year window, 22 November 2024–22 November 2026. Its selected evidence is from 2025–2026. It is a curated teaching set, not an exhaustive or statistically representative export of all support traffic. GitHub remains an available source adapter; the connected repository searched for this sample returned no matching issues in this window.

Share this kit with the cohort. Keep the separate instructor source register and SME identities within the instructor's authorized workspace. Classroom source IDs point to the sanitized evidence, not internal systems. These historical source cards teach evaluation and are not approved production policies.
