# LangSmith runbook

Reviewed against official documentation on 22 November 2026. The coding assistant implements the integrations in the project stack; learners inspect the UI and generated artifacts.

## Native Jev path

LangChain documents Jev as a typed decision model and provides a native LangSmith evaluation path. Add the TypeSafe provider secret, create an evaluator from the tracing project's Evaluators tab, select TypeSafe/Jev, map the trace data into state, and define focused questions as feedback keys. Keep grading rules in the questions rather than in the state. Record the resolved model version for the frozen benchmark; a moving `latest` alias is insufficient for a repeatable comparison. See [LangChain's Jev integration post](https://www.langchain.com/blog/jev-is-now-available-in-langsmith-evals).

The lesson need not rely on an undocumented claim about Jev's internal architecture. Its relevant property here is typed decisions rather than free-form answer generation. See [TypeSafe's introduction](https://docs.typesafe.ai/introduction). The [LangChain evaluation experiment](https://www.langchain.com/blog/jev-agent-evals-langsmith) motivates testing it, but vendor results do not establish agreement on this support dataset.

Use `config/judge-questions.json` as starting question definitions. Native UI/API field mappings should be confirmed against the current tool schema. Do not promise a generated rationale from a typed verdict. Store the question version, state hash, probabilities and any human adjudication.

## Laya alternative

Use `convaiinnovations/laya` explicitly for the classic text encoder; pin the model revision and runtime. The current upstream package's unqualified default can select another engine. Respect the selected checkpoint's token limit and score atomic evidence chunks rather than silently truncating a full conversation. Use a separate evaluator worker if the local encoder cannot run inside the hosted evaluator runtime. The worker posts feedback against the corresponding LangSmith run ID. See [upstream Laya documentation](https://github.com/NandhaKishorM/laya).

## Offline experiment

Create a versioned dataset with the query and allowed user context as inputs and references/criteria as reference outputs. Connect the actual agent as the experiment target and the calibrated judges plus deterministic checks as evaluators. Run v0 and v1 as separate experiments against identical data and source snapshots. See [LangSmith evaluation guide](https://docs.langchain.com/langsmith/evaluate-llm-application).

Retain the long-form CSV as a readable export. Attach aggregate parent-balanced scores, quality gates, latency distribution and cost accounting to the experiment report. Some per-case references are drafts until SME approval; label the dataset accordingly rather than uploading it as “gold”.

## Online scoring

Capture root response runs and child retrieval, tools and generation spans. Filter by environment and agent version. Configure online text evaluators on sampled completed responses, and deterministic checks on all eligible responses. Standard hosted code evaluators have restricted dependencies and no internet access; external model calls need a supported advanced evaluator or a separate worker. See [online code evaluator restrictions](https://docs.langchain.com/langsmith/online-evaluations-code).

Start with 10% random routine traffic plus all high-impact policy/action failures and explicit complaints. This is a teaching default, not a statistically optimized rate. Record sampling reason and probability. Random-sample metrics estimate broad quality; targeted queues find failures. Do not mix their denominators.

Use annotation queues for SME review of disagreements, low-confidence judgments and new failure modes. Keep rubric versions attached to labels. See [LangSmith inline annotations](https://docs.langchain.com/langsmith/annotate-traces-inline).

## Alert configuration

LangSmith's documented native alert metrics include errors, cost, feedback averages, run count and average latency, with 5- or 15-minute windows. It supports notification integrations including Slack and webhooks. Native average-latency alerts are not p95 alerts. See [LangSmith alerts](https://docs.langchain.com/langsmith/alerts).

These proposed values are classroom starting points. Verify them against real traffic before using as production thresholds.

| Signal | Proposed rule | Destination/action |
|---|---|---|
| Faithfulness | Mean binary pass score <0.95 over 15 min | Selected review/on-call destination; inspect cited evidence |
| Citation correctness | Mean deterministic pass <0.99 over 15 min | Inspect source IDs and renderer; no judge needed |
| Rude tone | Confirmed severe violation | Human review; do not wait for a high-volume average |
| Length limit | Any response >20 sentences | Add trace to review; cluster renderer/prompt failures |
| Errors | Error rate >2% over 15 min | Investigate model, retrieval and tool failures |
| Latency | Native mean >8 sec over 15 min | Check retrieval/generation spans; use an external aggregate for p95 >12 sec |
| Cost | Serving spend exceeds configured period budget | Check usage, retries and image/tool spend; distinguish judge cost |
| Judge health | Sampled runs lack feedback beyond 5 min, or evaluator errors >1% | Restore evaluation pipeline; do not interpret missing scores as passes |
| Retention | Mature D7 cohort rate drops >5 percentage points vs the agreed comparable baseline | Product analytics review; weekly window, not a five-minute query alert |

For percentage/mean quality alerts require at least 30 scored responses in the window and two consecutive failing windows before paging; otherwise send a low-volume review signal. Implement minimum-count, consecutive-window, p95 and retention rules in an external aggregation/webhook service when the native UI cannot express them. Add deduplication and cooldown. `config/monitoring-plan.json` is a specification, not a claim that those rules have been installed.

If one rule depends on evaluation output, filter explicitly for the feedback key before triggering downstream processing; do not assume independent automations run in order. See [online evaluation guidance](https://docs.langchain.com/langsmith/online-evaluations-llm-as-judge).

## Demonstrate the loop

1. Use a staging trace with an omitted citation or >20 sentences. Verify the deterministic feedback is attached to that trace.
2. Accumulate enough labeled staging events for the configured aggregation rule, or use a clearly marked staging-only threshold. Verify the actual alert at the explicitly selected destination.
3. Open the trace, annotate the failure and add a sanitized regression family. Preserve source and approval state.
4. Propose a fix, rerun offline evals, then promote through the existing release process.
5. Join the rollout version to product-event cohorts for D7/D30 retention. Do not call a trace score a business outcome.

Record deployment URL/version, actual experiment links, alert-test timestamp, destination and evidence in `artifacts/deployment-report.md`. If credentials, deployment target or destination are missing, name the specific unfinished connection; the lesson pack itself must not pretend those external actions occurred.
