---
name: build-golden-set
description: Guide an SME through creating a query-first tutor golden set with checked educational resources and reviewed expected answers.
---

# SME creates tutor evals

Read ../../references/lab-contract.md and ../../references/eval-spec.md. Complete checkpoint 1 only. The tutor v0 already exists; do not change it or add runtime guardrails.

## Intake

Use intake.json or ../../config/defaults.json. Ask only unanswered choices:
1. How many seed queries? Default 20.
2. Which query topics/goals matter? Concept explanation, design comparison, code reasoning, worked example, misconception correction, diagram interpretation. Defaults are saved.
3. Query inputs: bundled sanitized tutor questions by default; selected Slack/GitHub or read-only database exports are optional.
4. Educational evidence: papers, official documentation or lesson transcripts with direct resource links.
5. Per-query evals: relevance, context relevance, faithfulness, direct citations, tone, sentence limit, latency/cost, applicable storyflow/image quality. Retention stays production-only.
6. Custom tutor query, expected behavior, resource URL and optional severity.

Do not ask for user profiles, personas or demographics. No profile-based coverage or synthetic variants. Collect fields in chat; intake.html is optional.

## Select queries

Read ../../datasets/real-world/README.md and use ../../datasets/real-world/slack/ai-tutor.json. Select query candidates, preserving sanitized wording, stable record ID and exact original timestamp. Review heuristic labels, missing context and duplicates. Exclude operational requests and non-learning feedback. This lab has one tutor route.

The supplied ../../samples/golden-set.draft.json contains 20 real tutor questions with draft references. It is an example to curate, not an approved answer key. Never promote previous AI or peer replies to SME ground truth.

Recent historical questions get priority: w=2^(-age_days/180), with an explicit as-of date. Balance topic, query intent, ambiguity, evidence conditions and important misconceptions. Record curated selection rationale; do not claim random selection probabilities. SME-created questions have an authored date, not an invented customer timestamp.

## Source material and SME answers

Keep query provenance separate from educational evidence. Each approved seed needs a relevant source and direct well-formed HTTP(S) resource URL. Open the exact resource to check relevance and access; record date and sign-in requirements. Search-results pages, generic homepages, source:// placeholders and fabricated URLs are not valid citations.

Original lesson links may have been removed for privacy. A relevant public resource may be independently curated; do not claim it is the original lecture. If a question depends on an unseen diagram, obtain it or make clarification part of the reference.

Prepare golden-set.draft.csv with query, timestamp, source links, expected_response, required/forbidden behavior, review fields and notes. Assistant-written responses remain draft_unreviewed. The SME writes or approves references against the actual evidence and records reviewer/date. Keep pending and rejected cases separately.

Define the citation requirement here as an eval criterion. Do not enforce it in v0. Measure the saved starting tutor later; add enforcement in v1.

## Artifacts

Write golden-set CSV, source-register JSON, coverage CSV by topic/query intent/date/evidence condition, and a manifest with selection rules, recency, hashes and review state. Assign related families before calibration/validation splits. Set route=ai_tutor. Show three diverse query/source/answer examples and coverage, then stop.
