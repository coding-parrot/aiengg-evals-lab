---
name: import-discussions
description: Import hidden and visible discussions read-only, remove PII, and release reviewed tutor queries with timestamps and no profile fields.
---

# Import tutor queries

Read ../../references/discussion-import.md. Use the bundled tutor corpus now; the instructor supplies the private database connection later. Do not claim a database import before it runs.

Discover actual schema using read-only metadata. Map content, author role, exact timestamps, parent/thread linkage, lesson context and visibility. Use a read-only account, consistent snapshot and keyset pagination; never modify production visibility/data. Raw records and connection values remain in private-data/.

Run tools/prepare-discussions.mjs on the mapped export. It preserves raw candidates privately for audit. Its internal identity processing is for privacy only, not a teaching/profile workflow.

Review content for PII beyond regex patterns. Select only learning questions: explanations, design/code reasoning and misconceptions. Exclude operational requests, mixed cases, AI/staff answers, acknowledgments and non-learning feedback. tools/tutor-scope.mjs is a conservative candidate filter, not SME judgment.

Strip author/name/profile/persona fields from public output. Preserve sanitized query IDs, exact timestamps, provenance and known family links. Do not publish original IDs, private links or reversible identity maps. Reconcile duplicate database records and Slack relays.

Release only reviewed tutor content with included/excluded counts, hidden-state coverage and honest gaps. The current bundled release has 1,153 candidate questions, unknown hidden status and no verified database parent relationships.

Stop after ingestion. Trigger ../build-golden-set/SKILL.md separately for 20 query/evidence/answer cases; do not benchmark the full corpus automatically.
