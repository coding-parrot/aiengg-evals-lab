---
name: build-golden-set
description: Create an SME-reviewed customer-support golden set from Slack, GitHub or a custom data source, with recency weighting, provenance and reviewable references.
---

# Build the golden set

Read `../../references/lab-contract.md` and `../../references/eval-spec.md`. This skill finishes checkpoint 1 and shows its artifacts. It does not proceed to calibration or synthesize customer history.

## Intake

Use an existing `intake.json` or `../../config/defaults.json`. Ask only unanswered items; explicit selections persist.

1. How many seed queries? Default **20**.
2. Typical user profiles (multi-select): prospective learner, enrolled learner, working engineer, interview candidate, returning/lapsed learner, team administrator, custom. Default enrolled learner + working engineer + interview candidate.
3. Typical goals (multi-select): recover course access, solve payment/invoice problems, join classes, find recordings, obtain/correct certificates, choose a course, understand a concept, plan learning, resolve a technical issue, reach a human, custom. Default the first five + technical issue + human support.
4. Sources: Slack channels, GitHub repos/issues/discussions, custom read-only query/export. Default connected AIEngg/InterviewReady Slack support reports and selected GitHub support repos. Discover scopes before asking for what is already connected.
5. Business outcomes to monitor in production: retention (selected for this lab); suggest repeat contact, CSAT and verified resolution as optional additions. Keep these outside per-query evals. Use the already selected quality/latency/cost metrics in the eval spec.
6. Custom cases: accept query, profile, goal, expected behavior, source and severity. Label SME-created cases separately from real customer history.

Provide the local intake form or equivalent fields. Do not force defaults that the SME changed.

## Source collection and selection

For the expanded support + tutor lab, read `../../datasets/real-world/README.md` and use `../../datasets/real-world/slack/discussions.all.json` or the reviewed output of `../import-discussions/SKILL.md`. The 40-row sample is only an optional preview. Preserve original discussion wording, exact timestamps, timestamp meaning, fictional-profile status and unknown visibility. Select 20 seeds across the requested routes from the full corpus, rather than limiting ingestion to 20. Start with `query_or_request` candidates; inspect the heuristic message-kind and route labels before accepting them. Exclude known AI replies from learner queries and never use them as SME references. Add lesson transcripts/papers as evidence for tutor questions and obtain SME-written references; null expected answers are not labels. Keep known threads and repost groups together in splits; Slack parent relationships are unavailable, so inspect suspected related cases before claiming family independence. Report support and tutor coverage separately, and retain the original support-only lesson as a separately versioned benchmark.

For the shared classroom source choice, use `../../samples/golden-set.draft.json` and `../../samples/sanitized-source-cards.json`; preserve their draft status, curate against the intake and produce the review artifacts without requiring company access. For selected live sources, use available MCP tools first. Search the last two calendar years relative to an explicit as-of date. Query Slack support content, read useful threads, and distinguish actual customer messages, staff reports, policy discussions and internal tests. Search GitHub issues/discussions within the relevant connected repositories; a feature request or code snippet is not a customer conversation. Preserve pagination and search/filter metadata. Do not equate no results from one repo with no issues anywhere.

For custom sources, discover schema or require a mapped redacted export. Do not assume a database table exists. Normalize to ID, thread/family, timestamp, product, query, source URL and evidence. Remove names, emails, phones, account IDs, payment references and private attachment links from student-facing text. Preserve sensitive source locators in the instructor register.

Deduplicate messages and related incidents before selection. Recent cases get priority using a default 180-day half-life, `w=2^(-age_days/180)`. Reserve coverage for important goals, both products, ambiguous requests, missing/conflicting sources and high-impact failures. Sample without replacement within the chosen strata using a recorded seed; keep the rationale for curated inclusions. If mandatory cells exceed 20, show the coverage tradeoff. Never claim selection probabilities for a hand-curated set.

Prefer customer wording when available. If the available evidence is a staff report, reconstruct a user question and mark `query_provenance=reconstructed_from_staff_report`. Keep an evidence summary, original timestamp and source reference. Do not backdate synthetic text or claim that a reconstructed sentence was sent by a customer.

## Reference answers

Create `golden-set.draft.csv`. The assistant may draft expected answers and required/forbidden behavior, but those are not SME-authored or SME-approved. Provide editable `sme_status`, `sme_reviewer`, `sme_reviewed_at` and notes fields. The SME can replace the draft answer with their own response.

Version approved knowledge separately from support logs. Historical fixes and proposed policies require current-source confirmation. Preserve historical policy only for a clearly time-scoped scenario. Never copy operational gossip, passwords or internal URLs into the intended customer response.

The instructor reviews the file, writes/approves the expected responses and names the relevant sources. Promote reviewed rows into `golden-set.csv`; preserve all declined or pending rows separately. For teaching before approval, display a conspicuous draft label and do not claim to have obtained SME judgment.

## Artifacts and completion

Write source register JSON; golden-set CSV; coverage CSV by product, intent, profile, date bucket and provenance; and a manifest with window, selection method, recency rule, hashes and gaps. Assign family splits before later stages. All seed rows need source lineage and an honest review status. Show three diverse rows and the coverage result. Stop at checkpoint 1.
