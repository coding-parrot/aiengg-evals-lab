# Lab contract

## Confirmed choices

- Experience: natural-language triggers in a coding assistant; the assistant writes and runs the code.
- Use case: AIEngg support, informed by AIEngg and InterviewReady support history.
- Sources: Slack and GitHub, with an optional custom read-only data adapter.
- Seed count: 20. Expansion: **200 additional**, so 220 total.
- Recent queries receive greater priority. Default half-life: 180 days, editable by SME.
- Text judge: OpenAI Decisions by default, using the same instructor OpenAI key as the bot. Jev and explicitly named Laya are optional alternatives. Decisions is a typed judge; encoder-only architecture is not established by its docs.
- Per-query evals: answer relevance, context relevance, faithfulness, citations, politeness, maximum 20 sentences, latency and cost. Storyflow and generated-image scores are separate applicable dimensions.
- Business monitoring: user retention in production, never a per-query judge score.

## Agent behavior

Work within the current stage. Implement using the project's stack, with TypeScript as the new-project default. Use current official documentation for integrations. Keep model calls real and failures visible. If credentials are unavailable, finish files and local checks and record the remaining connection step; do not silently substitute mock results.

Keep `artifacts/lab-state.json` with completed stages, dataset version, source snapshot hashes, prompt/model versions, judge versions, SME review state and next action. Preserve prior run artifacts under distinct experiment IDs.

The bot sees the query, permitted customer context and retrieved knowledge only. It never sees expected answers, SME labels, pass/fail expectations, case IDs that encode answers, synthetic metadata or judge scores. Do not tune v0 after seeing benchmark failures. Save v1 separately.

At checkpoint 0, use `../prompts/support-starting-system.txt` exactly as the starting system prompt. Record its hash. Call the versions “Starting bot” and “Improved bot” in learner-facing explanations; `v0` and `v1` are their experiment labels. The first paired comparison changes only the prompt while replaying identical retrieved evidence and model settings. Later retrieval/tool changes are separate whole-agent experiments. Follow `before-after.md`.

Support logs tell us what to test; approved knowledge sources tell the bot what to answer. Maintain separate stores. An internal report, proposed policy or obsolete incident ETA is not current authoritative customer guidance. Source cards need visibility, effective dates, product/cohort scope and an approved customer-safe citation target before production use.

## Trace shape

One root run per response; shared conversation/thread ID across turns. Child spans: retrieval per source system, reranking, tool execution, generation and image generation where applicable. Record:

`query`, `brand`, `conversation_id`, pseudonymous `user_id`, `agent_version`, `environment`, `source_snapshot`, `retrieved_context[]` (id, type, version, relevance candidates, visibility), `answer`, `citations[]`, `tool_calls[]`, `image_artifact`, `ttft_ms`, `total_latency_ms`, token usage, retrieval/tool/image/model costs and errors.

Use actual usage and a dated price sheet. Report agent serving cost and evaluation cost separately. Missing token usage/prices are unknown cost, not zero. Include failed and retried calls. TTFT is only measured on streaming output; otherwise unavailable.

## Reproducibility and leakage

Group related cases by original customer incident/conversation. Split parent families before calibration and synthetic generation. Keep every sibling in its parent's split. Use about 60% of families for judge calibration and 40% for judge validation in this small demonstration. Human ratings are on `(query, retrieved context, actual answer, metric)`.

All 220 cases are run as requested. Report calibration-exposed families and held-out families separately. The aggregate is a diagnostic baseline; this small set is not a certification of production quality. When engineers tune against failures, those cases become development/regression data. Add new unseen families for independent release validation.

Do not call synthetic examples 10x more independent evidence. Use original-only and synthetic-only reports; parent-balanced aggregation; and family-level uncertainty estimates if reporting intervals.

## Data handoff

`golden-set.csv` minimum columns: `case_id`, `family_id`, `source_type`, `source_ref`, `source_observed_at`, `query_provenance`, `brand`, `profile`, `goal`, `intent`, `query`, `expected_response`, `required_behaviors`, `forbidden_behaviors`, `source_ids`, `as_of`, `policy_version`, `split`, `recency_weight`, `sme_status`, `sme_reviewer`, `sme_reviewed_at`.

Synthetic rows also need `parent_id`, `generation_method`, `matrix_cell`, `transformation`, `semantic_change`, `expected_changed`, `review_status`. Expected answers for changed scenarios must be separately written or verified.

`judge-labels.csv` is long form: `candidate_id`, `case_id`, `family_id`, `split`, `metric`, `query`, `context_snapshot`, `actual_answer`, `image_ref`, `human_label`, `human_notes`, `human_reviewer`, `label_version`. Blank labels are not failures or approvals.

`eval-results.csv` is long form: `experiment_id`, `case_id`, `family_id`, `origin`, `split`, `repetition`, `metric`, `value`, `verdict`, `applicable`, `reason_or_evidence`, `judge_id`, `judge_version`, `rubric_version`, `error`, `trace_url`. Code checks give their actual evidence. Typed judges need not generate prose rationales; record typed probabilities and the relevant input excerpt instead of inventing explanations.
