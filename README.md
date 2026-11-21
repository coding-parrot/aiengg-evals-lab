# AIEngg Evals Lab

**Start with the packaged v0 support bot, discover its failures, create v1, and measure the difference.**

A hands-on cohort lab run through your favorite coding assistant: Codex, Claude, or an assistant in your IDE. You give the prompts; your assistant builds and runs the code. At each checkpoint, you inspect real queries, answers, judge decisions and experiment results.

**All 2,946 collected Slack discussion records are included**, with identifying details scrubbed, 1,044 fictional profiles and exact UTC timestamps. Open the [full CSV](datasets/real-world/slack/discussions.all.csv), [customer-support CSV (439 records)](datasets/real-world/slack/customer-support.csv), or [AI-tutor CSV (2,507 records)](datasets/real-world/slack/ai-tutor.csv). JSON and JSONL are also available. These counts include replies and feedback: 779 AI replies are explicitly flagged, and expected answers remain unlabeled. Read the [dataset guide](datasets/real-world/README.md) before selecting your golden set. The earlier 40-query file remains as an optional preview.

**Full database import is ready to configure:** add your connection file locally as `config/database.connection.local.json`, following [the setup](references/discussion-import.md), then trigger [import-discussions](skills/import-discussions/SKILL.md). It includes hidden discussions without changing their production visibility. The database connection and full import are pending; Slack does not expose current hidden status.

## The lesson

```text
Starting bot → SME golden set → Calibrated judges → 200 synthetic cases
      ↓                                                 ↓
Save version                                    Measure starting bot
                                                        ↓
Production monitoring ← Deploy ← Compare ← Improve from observed failures
```

The **Starting bot** is called **v0** in experiment files. The **Improved bot** is called **v1**. They can use exactly the same LLM. Evals do not automatically make an LLM smarter: they show which application behavior needs fixing and whether a change helped.

## Start here

1. Open the public lab URL and enter the **shared student API key** used by everyone. No individual invitation, login, OpenAI key or provider account is needed. For the full IDE lab, clone this repo, click “Connect my IDE” in the lab, and have your assistant put the downloaded `.env` in the repo root. See [operator setup](references/cohort-hosting.md).
2. Open [intake.html](intake.html) locally to select profiles, goals and data sources. It can export `intake.json`. The default is **20 seeds + 200 synthetic cases = 220 cases**.
3. Paste this prompt into your assistant:

> Read README.md, START-HERE.md and references/tool-contract.md. Begin checkpoint 0. Use the packaged v0 bot at the public lab URL with the shared student API key; do not create a replacement bot or modify its prompt/retrieval. If working locally as the instructor, start tools/cohort-server.mjs using the configured private environment. Show the existing bot and let me try three questions. Save the actual answers, retrieved sources, prompt/model identifiers and source snapshot. Stop before creating or running the eval suite. We will create v1 from observed failures later.

The instructor configures **one existing OpenAI key** on the shared backend for both the bot and OpenAI Decisions judge. Students need no provider accounts, keys or billing setup. The browser demo needs no install; the full IDE workflow needs a repo checkout, Node 22+ and its downloaded classroom connection file. LangSmith credentials are instructor-only and added at the monitoring checkpoint. Sanitized data is included. The operator must supply hosting and live credentials before the public URL works; this repository does not include a running service.

If your assistant does not support installed skills, tell it to read each `SKILL.md` directly. The file-based prompts work without a particular slash-command convention.

## Default starting prompt

The full prompt is [prompts/support-starting-system.txt](prompts/support-starting-system.txt):

> You are the customer support assistant for AIEngg and InterviewReady.
>
> Help learners with course access, payments, invoices, live classes, recordings, certificates and learning resources. Use the conversation and the information provided to answer their question. Be friendly, clear and practical. If you cannot resolve a request, suggest contacting the support team.
>
> Protect private customer information. Do not claim that you changed an account, issued a refund or completed another action unless a tool confirms that it succeeded.

This is a realistic basic prompt. Keep it unchanged until the starting benchmark is recorded. The assistant creates the improved prompt from observed failures later.

## Follow-along checkpoints

| Step | Tell your assistant | Open the result |
|---|---|---|
| 0. Try packaged v0 | Open the public lab with the shared student key and use the start prompt above. | Bot UI, three answers, saved prompt/configuration |
| 1. Golden set | Read `skills/build-golden-set/SKILL.md` and create our golden set using the intake. | Query CSV, source provenance, coverage, SME edits |
| 2. Judge calibration | Read `skills/calibrate-judges/SKILL.md`. Run the seed queries and prepare actual answers for SME ratings, then calibrate the judges. | SME labels, disagreement examples, confusion tables |
| 3. Synthetic data | Read `skills/expand-eval-data/SKILL.md` and generate 200 additional cases from the 20 approved seeds. | Product matrix, variants, changed expectations |
| 4. Starting score | Read `skills/run-benchmark/SKILL.md` and benchmark the saved starting bot on all 220 cases. | Baseline scorecard, cost/latency, failing traces |
| 4a. Error coding | Read `skills/analyze-errors/SKILL.md`. Code observed failures and show where to focus. | Coding CSV, taxonomy, ranked error chart, optional spider chart, proposed regression cases |
| 5. Improved score | Read `references/before-after.md`. Fix an observed prompt-related failure, save the improved bot, and rerun the same benchmark with identical evidence and judges. | Prompt diff, paired answers, wins and regressions |
| 6. Production loop | Read `skills/monitor-production/SKILL.md` and prepare the LangSmith deployment/monitoring checkpoint. | Traces, feedback, staging alert drill, retention event contract |

Pause after each checkpoint so the class can inspect its output. The exact prompts and artifact names are in [START-HERE.md](START-HERE.md).

## What we evaluate

| Per-query dimension | Evaluator |
|---|---|
| Answer relevance | Focused OpenAI Decisions judge |
| Retrieved-context relevance | Judge each source chunk; separate papers, search and transcripts |
| Faithfulness and citation support | Claims checked against evidence and successful tool results |
| Visible, valid citations | Deterministic code check |
| Polite tone | Focused text judge |
| Maximum 20 sentences | Deterministic code check |
| Latency / TTFT and serving cost | Instrumented measurements, separate from judge overhead |
| Storyflow | Anchored 0–4 rubric when applicable |
| Generated-image quality | Actual-image inspection by a validated vision judge or SME |

**User retention is monitored in production over user cohorts. It is not a per-query eval.** See [the full metric definitions](references/eval-spec.md).

## Make the before/after comparison fair

- “No evals yet” means **unmeasured**, not a score of zero. Evaluate the saved starting bot after the test set and judges are ready.
- Run both versions on the same 220 cases, source fixtures, model/settings, judges and thresholds. For the first comparison, change only the system prompt.
- Show each metric and its denominator, side-by-side answers, cost/latency, and regressions. Do not fill in an improvement percentage before executing the experiment.
- Keep later retrieval/tool improvements as separately identified whole-agent experiments.

Follow [the complete comparison protocol](references/before-after.md).

## Files worth opening

| File or folder | Purpose |
|---|---|
| [skills/](skills/) | Seven skills covering the five evaluation stages, error coding and discussion import |
| [references/error-coding.md](references/error-coding.md) | Error taxonomy, visual prioritization, SME review and regression-case workflow |
| [datasets/real-world/](datasets/real-world/) | Original discussion queries, fictional profiles, redacted staff evidence and coverage |
| [tools/cohort-server.mjs](tools/cohort-server.mjs) / [cohort.html](cohort.html) | Implemented v0 bot, retrieval, API and browser UI |
| [config/v0-manifest.json](config/v0-manifest.json) | Packaged baseline hashes and configuration |
| [prompts/](prompts/) | Fixed starting system prompt and prompt-version guidance |
| [samples/golden-set.draft.csv](samples/golden-set.draft.csv) | 20 source-derived seed questions with draft expected responses |
| [samples/synthetic-queries.draft.csv](samples/synthetic-queries.draft.csv) | 200 variants with parent links and review state |
| [samples/benchmark.draft.json](samples/benchmark.draft.json) | Machine-readable combined dataset |
| [samples/review.xlsx](samples/review.xlsx) | Editable SME review copy |
| [samples/sanitized-source-cards.json](samples/sanitized-source-cards.json) | Classroom evidence without private source links or customer contact details |
| [references/tool-contract.md](references/tool-contract.md) | Runnable helpers and the endpoint contract your assistant implements |
| [references/facilitator-guide.md](references/facilitator-guide.md) | Instructor timing, reveal sequence and discussion questions |
| [references/cohort-hosting.md](references/cohort-hosting.md) | One operator OpenAI key, shared student API key, hosting and usage limits |
| [references/langsmith-runbook.md](references/langsmith-runbook.md) | Decisions integration, tracing, optional Jev/Laya and monitoring |

## Data and execution status

The seeds are sanitized reconstructions of actual support/issue reports, not verbatim customer messages. Their expected responses are **assistant drafts awaiting SME review**. There are 18 incident families across the 20 seeds. The synthetic data also needs scenario and expected-answer review. Historical incident reports are classroom evidence, not current production policies.

The requested source window was 22 November 2024–22 November 2026; the selected reports are from 2025–2026. This is a curated teaching sample, not an exhaustive traffic export. The instructor's private source-link register is deliberately excluded from this repository.

This repository contains skills, data and runnable helper tools. The v0 bot, retrieval, browser UI, OpenAI connection and Decisions adapter are already implemented. Your assistant uses this packaged baseline, then creates v1 and completes later integrations during the lab. No paid judge runs, benchmark score improvements, production deployment or installed alerts are claimed in advance. See [VALIDATION.md](VALIDATION.md) for checks performed and remaining live checks.

## Local helper checks

Ask your assistant to run:

```sh
node --test tools/checks.test.mjs
node --test tools/prepare-discussions.test.mjs
node --test tools/build-slack-dataset.test.mjs
node --test tools/cohort.test.mjs
```

For real execution examples, open [the tool contract](references/tool-contract.md). Use the explicit draft mode only for a labeled preliminary classroom run. Keep credentials, raw production traces and private source exports out of Git.
