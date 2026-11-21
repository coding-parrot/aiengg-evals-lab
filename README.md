# AIEngg Evals Lab

**Build a support bot, discover its failures, improve it, and measure the difference.**

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

1. Clone or download this repository and open the folder in your coding assistant.
2. Open [intake.html](intake.html) locally to select profiles, goals and data sources. It can export `intake.json`. The default is **20 seeds + 200 synthetic cases = 220 cases**.
3. Paste this prompt into your assistant:

> Read README.md, START-HERE.md and references/tool-contract.md. Begin checkpoint 0. Build a simple AIEngg/InterviewReady customer support bot using the existing project stack, or TypeScript for a new project. Load prompts/support-starting-system.txt verbatim as its system prompt. Use the sanitized source cards for classroom retrieval, and never give the bot the golden answers or eval rubric. Use a real model connection, and implement the response/trace contract. Show me the bot and let me try three questions. Save this starting version and its configuration. Stop before creating the eval suite.

You need a working model connection for the bot. For the supplied live judge helpers, set TypeSafe/Jev credentials securely in your environment. LangSmith credentials are needed for hosted experiments and monitoring. The included Node.js helpers require Node 20+ and use built-in modules. Students do not need access to AIEngg's Slack or GitHub: sanitized source snapshots are included.

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
| 0. Starting bot | Use the start prompt above. | Bot UI, three answers, saved prompt/configuration |
| 1. Golden set | Read `skills/build-golden-set/SKILL.md` and create our golden set using the intake. | Query CSV, source provenance, coverage, SME edits |
| 2. Judge calibration | Read `skills/calibrate-judges/SKILL.md`. Run the seed queries and prepare actual answers for SME ratings, then calibrate the judges. | SME labels, disagreement examples, confusion tables |
| 3. Synthetic data | Read `skills/expand-eval-data/SKILL.md` and generate 200 additional cases from the 20 approved seeds. | Product matrix, variants, changed expectations |
| 4. Starting score | Read `skills/run-benchmark/SKILL.md` and benchmark the saved starting bot on all 220 cases. | Baseline scorecard, cost/latency, failing traces |
| 5. Improved score | Read `references/before-after.md`. Fix an observed prompt-related failure, save the improved bot, and rerun the same benchmark with identical evidence and judges. | Prompt diff, paired answers, wins and regressions |
| 6. Production loop | Read `skills/monitor-production/SKILL.md` and prepare the LangSmith deployment/monitoring checkpoint. | Traces, feedback, staging alert drill, retention event contract |

Pause after each checkpoint so the class can inspect its output. The exact prompts and artifact names are in [START-HERE.md](START-HERE.md).

## What we evaluate

| Per-query dimension | Evaluator |
|---|---|
| Answer relevance | Focused Jev/Laya judge |
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
| [skills/](skills/) | Five evaluation-stage skills plus the discussion-import skill |
| [datasets/real-world/](datasets/real-world/) | Original discussion queries, fictional profiles, redacted staff evidence and coverage |
| [prompts/](prompts/) | Fixed starting system prompt and prompt-version guidance |
| [samples/golden-set.draft.csv](samples/golden-set.draft.csv) | 20 source-derived seed questions with draft expected responses |
| [samples/synthetic-queries.draft.csv](samples/synthetic-queries.draft.csv) | 200 variants with parent links and review state |
| [samples/benchmark.draft.json](samples/benchmark.draft.json) | Machine-readable combined dataset |
| [samples/review.xlsx](samples/review.xlsx) | Editable SME review copy |
| [samples/sanitized-source-cards.json](samples/sanitized-source-cards.json) | Classroom evidence without private source links or customer contact details |
| [references/tool-contract.md](references/tool-contract.md) | Runnable helpers and the endpoint contract your assistant implements |
| [references/facilitator-guide.md](references/facilitator-guide.md) | Instructor timing, reveal sequence and discussion questions |
| [references/langsmith-runbook.md](references/langsmith-runbook.md) | Jev/Laya integration, tracing, online evaluations and alerts |

## Data and execution status

The seeds are sanitized reconstructions of actual support/issue reports, not verbatim customer messages. Their expected responses are **assistant drafts awaiting SME review**. There are 18 incident families across the 20 seeds. The synthetic data also needs scenario and expected-answer review. Historical incident reports are classroom evidence, not current production policies.

The requested source window was 22 November 2024–22 November 2026; the selected reports are from 2025–2026. This is a curated teaching sample, not an exhaustive traffic export. The instructor's private source-link register is deliberately excluded from this repository.

This repository contains skills, data and runnable helper tools. Your assistant builds the bot and completes the integrations during the lab. No paid judge runs, benchmark score improvements, production deployment or installed alerts are claimed in advance. See [VALIDATION.md](VALIDATION.md) for checks performed and remaining live checks.

## Local helper checks

Ask your assistant to run:

```sh
node --test tools/checks.test.mjs
node --test tools/prepare-discussions.test.mjs
node --test tools/build-slack-dataset.test.mjs
```

For real execution examples, open [the tool contract](references/tool-contract.md). Use the explicit draft mode only for a labeled preliminary classroom run. Keep credentials, raw production traces and private source exports out of Git.
