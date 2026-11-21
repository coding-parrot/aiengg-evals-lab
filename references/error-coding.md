# Error coding and visual prioritization

Trigger after a real run:

> Read skills/analyze-errors/SKILL.md. Use our latest eval results and saved traces. Open-code failures, consolidate a draft taxonomy, and show a ranked error-frequency chart with severity and affected families. Include a before/after spider chart only for comparable metrics. Show the top focus areas with examples and proposed regression cases. Keep SME review pending and pause before changing the bot.

Use the same trigger later with selected LangSmith traces, through available integrations or a local export. No particular IDE or globally installed slash command is required. The discussion corpus supplies scenarios, not observed agent failures.

## Starter taxonomy, not observed findings

| Code | Definition / boundary |
|---|---|
| `routing.wrong_route` | Support request sent to tutor or vice versa; mixed requests need explicit handling |
| `retrieval.irrelevant_context` | Retrieved context does not address the request |
| `retrieval.missing_evidence` | Necessary evidence absent; distinguish unavailable source from retrieval failure |
| `answer.irrelevant_or_incomplete` | Answer misses the actual request or a required part |
| `answer.unsupported_claim` | Claim lacks support in evidence or confirmed tool results |
| `citation.missing` | Required visible citation absent |
| `citation.invalid_or_unsupported` | Citation invalid or does not support the associated claim |
| `tool.incorrect_or_unconfirmed_action` | Wrong tool/arguments/order, or action claimed without success evidence |
| `policy.privacy_or_escalation` | Privacy exposure, policy violation or required escalation missed |
| `style.impolite` | Tone violates the polite-response rubric |
| `style.over_20_sentences` | Deterministic sentence check exceeds the limit |
| `storyflow.poor_structure` | Applicable storyflow rubric fails its agreed threshold |
| `image.quality_failure` | Actual image fails its reviewed rubric; absent image handled separately |
| `performance.latency_budget` | Measured serving latency exceeds the agreed budget |
| `performance.cost_budget` | Measured serving cost exceeds the agreed budget; unknown is not zero |
| `evaluation.judge_or_rubric_error` | Evidence supports a grader/rubric issue, not an automatic agent failure |
| `data.reference_or_context_gap` | Incorrect reference, missing diagram or insufficient scenario context |
| `infrastructure.execution_failure` | Agent/tool/evaluator execution failed; record which component |
| `other` / `uncertain` | New failure mode or insufficient evidence; retain notes for review |

Separate the failed metric from the error code and suspected cause. Multiple codes may apply. No starter code is evidence that the bot actually failed.

## Files students inspect

Use CSV plus JSON where nested evidence makes it clearer. Preserve timestamps as strings with source precision/timezone. Store one coding row per response execution and code, with a stable annotation ID to retain reviewer revisions.

| Artifact | Required contents |
|---|---|
| `error-coding.csv` | annotation_id, experiment_id, case_id, family_id, repetition, route, origin, source_observed_at, run_started_at, metric, judge_verdict, human_verdict, error_code, taxonomy_version, observation, evidence_ref, suspected_cause, cause_status, severity, review_status, reviewer, reviewed_at |
| `error-taxonomy.json` | Version, code definitions, inclusion/exclusion criteria, real example IDs, owner/component, changes from prior version |
| `coding-review.csv` | Original reviewer labels, disagreements, adjudication, reviewer/time; pending when no SME has reviewed |
| `error-summary.csv` | Code, scope, unique affected runs/cases/families, eligible denominator, coverage, severity counts, review counts, weighting method if any |
| `error-analysis.html` | Ranked bars, optional radar, denominator tables, focus areas, evidence examples, filters and provenance |
| `regression-candidates.csv` | Source case/family, error code, required/forbidden behavior, evidence, expected-answer draft, SME state, proposed suite/version; no automatic promotion |
| `analysis-manifest.json` | Input paths/hashes, experiment/taxonomy versions, sampling method, selected/eligible counts, missing fields, review state and chart aggregation definitions |

For absent source fields store null with a coverage note; never invent lineage, timestamps or reviewers. Reports use sanitized excerpts and local trace references. Private traces stay in the instructor's authorized environment.

## Chart rules

**Default: ranked horizontal bars.** Categorical errors call for a bar chart; a numerical histogram is appropriate for latency/cost distributions. Label the axis precisely, such as “unique reviewed cases with this code.” Count each case once per code within the selected experiment, even across repetitions. Show affected runs and independent families in the table too. Multiple labels mean category totals can exceed the number of cases; state this beside the chart. Repetitions and synthetic siblings must not inflate apparent independent evidence.

Use severity overlays or adjacent markers and show the aggregation rule. Default severity: critical (privacy/action/policy harm), major (blocks resolution/learning), minor (limited usability issue), unassessed. Let the SME adjust definitions. In a case-count bar assign the case's highest observed severity for that code so stacked counts do not double-count it. Separate agent-quality codes from evaluator/data/infrastructure codes or provide a clearly labeled filter.

Show reviewed/eligible coverage and sampling rules. If codes were assigned only to inspected traces, label percentages as a share of reviewed cases, not all traffic. Unreviewed cases are not error-free. Show original/synthetic views and family counts. Recency-weighted priority can be additional, with formula/as-of date, never a substitute for raw counts.

**Optional spider/radar: higher is better on every axis.** Use identical metric definitions, judges, thresholds and comparable cohorts for both versions. Suitable axes include answer relevance, context relevance, faithfulness, citation pass rate and polite-tone pass rate on a labeled 0–100% scale. Show applicable/scored denominators and coverage per axis in a companion table. Display a numerical storyflow score separately, or convert it to pass rate only using the pre-existing agreed threshold. Do not mix mean 0–4 ratings with pass rates.

Latency, dollar cost, error counts and retention stay outside the quality radar. Report cost/latency separately in their units with budgets; retention is a production cohort metric. Image/storyflow axes require actual applicable observations and compatible rubrics. Do not close a polygon across missing axes or replace N/A with zero. If dimensions/cohorts are not comparable, omit the radar and explain why. The radar summarizes scores; evidence-linked failure bars determine what to investigate.

Every chart comes from saved analysis data. Include experiment, dataset/taxonomy versions, review state, sample size and plotted-value tables/downloads. Without results show “No observed results yet” and the inputs needed. Avoid chart CDN dependencies so the shared report works locally.
