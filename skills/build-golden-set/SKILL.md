---
name: build-golden-set
description: Interview the user before creating a query-first tutor golden set, then use their answers to select queries, check educational resources and prepare SME-reviewed expected answers.
---

# SME creates tutor evals

Read ../../references/lab-contract.md and ../../references/eval-spec.md. Complete checkpoint 1 only. The tutor v0 already exists; do not change it or add runtime guardrails.

## Required interactive intake — ask, then wait

Begin each new golden-set creation with questions to the user. Read intake.json and ../../config/defaults.json only to propose defaults; file values and sample rows are not user answers. Do not silently accept defaults, select the seed set, draft references or generate the golden-set files before the user answers. Silence or elapsed time is not acceptance.

Ask these questions in two short batches of up to three. Show suggested answers, accept free text, and allow the user to reply “use all proposed defaults.” Use the IDE's question tool when available; otherwise ask in ordinary chat and stop the turn to wait. No browser or form is required.

First batch:
1. **How many original queries do you want?** Suggested: 20.
2. **Which tutor topics or question types should we include or exclude?** Offer concept explanations, design comparisons, code reasoning, worked examples, misconception correction and diagram interpretation. Suggested: the bundled topic mix.
3. **Where should the queries come from, and what date range matters?** Offer bundled real tutor queries, selected Slack/GitHub discussions, a read-only export, or SME-written cases. Suggested: bundled corpus, last two years relative to the recorded as-of date, prioritizing recent queries with a 180-day half-life. Ask for scope only when a live source is selected.

Second batch:
4. **Which educational resources should the expected answers use?** Offer bundled checked resources, user-provided paper/lesson/document links, or finding additional primary sources. Suggested: bundled resources. Ask for any required or excluded sources; every approved tutor reference needs a checked direct resource link.
5. **What should a good answer be evaluated on?** Propose relevance, context relevance, faithfulness, direct citations, polite tone, at most 20 sentences, latency/cost and applicable storyflow/image quality. Ask what to add or change. Keep retention production-only.
6. **Any custom queries or must-test failures, and how do you want to write the expected answers?** Suggested: no extra cases; assistant drafts for SME editing. Alternative: the SME supplies the answers. Accept query text, expected behavior and resource links in chat. Do not invent custom inputs or SME approval.

If the user already explicitly answered an item for this generation request, show it as their selected answer instead of asking it again. Saved choices from an earlier run should be presented for reuse or change, not silently adopted. Ask the unresolved questions and wait. An explicit current reply accepting all shown defaults completes intake; merely invoking the skill does not.

After answers arrive, summarize the selected settings and write artifacts/golden-set-intake.json with status=user_confirmed, actual answers, selected sources/topics/count/metrics/reference-authoring mode and any exclusions. If the user changes a setting, update it before generation. Then continue with the authorized creation; no extra generic permission question is needed.

Do not ask for profiles, personas or demographics. The intake is about queries, evidence and expected behavior. The optional HTML form does not replace asking the user in the conversation.

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
