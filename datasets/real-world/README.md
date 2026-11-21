# Tutor query dataset

The active release contains **1,153 sanitized tutor query candidates**, with stable query IDs and exact notification timestamps. Use [JSON](slack/ai-tutor.json), [CSV](slack/ai-tutor.csv) or [JSONL](slack/ai-tutor.jsonl). The discussions.all files contain the same tutor-only subset for compatibility; do not concatenate them.

No learner profiles or persona fields are included. The teaching unit is a query, its educational evidence and expected answer.

## Scope and provenance

The original collected Slack feed contained 2,946 discussion records. The active lab excludes 1,793 records based on non-tutor or mixed intent, known AI authorship, non-query record kind and operational-request filtering. tools/tutor-scope.mjs implements the conservative filter. Existing labels are partly heuristic; some remaining candidates may be statements or need lesson context. Review actual questions before SME approval.

The wording retains prior privacy redaction. created_at preserves the original Slack notification timestamp as an ISO UTC string with all six fractional digits. It is not verified database creation time. record_id is a stable sanitized query locator. Do not convert timestamps into a representation that loses precision.

Expected answers remain null/unlabeled on corpus rows. AI/peer replies are not ground truth. Duplicate text and related questions need family grouping; original database thread relationships and hidden status remain unavailable.

The selected corpus is not proof of database completeness. The original collection included a webhook rate-limit notice. See [manifest](slack/manifest.json) for exact counts and checksum. Earlier dataset versions remain in Git history; the active release is narrowed to tutor candidates.

## Educational source links

Corpus candidates may lack original lesson context. Before approving a tutor seed, supply checked educational evidence with a direct resource link. Never invent the original lecture URL or diagram.

The 20 supplied seed examples link to actual papers and official resources, checked on 22 November 2026. Their 18 source cards are short assistant paraphrases, not complete original documents or SME-approved material. Source URLs were independently curated after private links were removed; query provenance and teaching references are separate.

Use [build-golden-set](../../skills/build-golden-set/SKILL.md) to select 20 queries and obtain SME references. Generate 200 variants only at the next requested expansion stage.

## Database later

The read-only import remains prepared for a private connection file. Import hidden records for reconciliation, keep raw content private, and release only reviewed tutor queries with PII removed. Strip author/profile fields from the public release. Preserve database timestamps and known thread links, and deduplicate Slack relays.
