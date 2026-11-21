---
name: import-discussions
description: Import all InterviewReady discussions including hidden records through a read-only database connection or export, de-identify them, and prepare customer-support and AI-tutor datasets.
---

# Import real discussions

Read `../../references/discussion-import.md`. The user's connection file is supplied later; do not claim a database import until connected. Look for `config/database.connection.local.json` or the path explicitly provided. Do not display credential values. Keep raw exports, connection details and identity mappings in gitignored `private-data/`.

Discover the actual schema with read-only metadata queries. Map discussions, replies, authors, course/lesson context, creation timestamps and hidden/deleted flags. Do not assume table or column names. Use a read-only account and transaction; no migrations, grants, updates, or visibility changes. Select only necessary columns, omit email/phone/address/payment data, and avoid SELECT *. Export all history, including hidden discussions; the 20-seed limit applies to later golden-set selection, not ingestion. Report visible/hidden/unknown counts and inaccessible/deleted records separately. Use consistent-snapshot counts and keyset pagination to reconcile every exported row against the source.

Normalize to the canonical JSON shape in the reference. Preserve parent relationships, known actor roles and explicit visibility. Then run `node tools/prepare-discussions.mjs private-data/discussions.raw.json`. This produces private review candidates, never an automatic public release.

Review every candidate's text for PII and sensitive identifying context, including names inside examples/code, links, attachments, addresses, employers, IDs and quoted signatures. The regex scrubber is only a first pass. Drop unnecessary personal context; replace necessary identities with fictional profiles. Review the identity map privately and keep the public profiles separate. Do not publish real IDs, raw hashes of personal identifiers, source permalinks or a reversible identity map.

Route each learner query by intent: account/payment/access/platform requests → customer_support; conceptual explanations, design questions, code reasoning and study guidance → ai_tutor. Mixed complaints with a learning question may need both; mark the secondary route. Do not classify a system-design question as support merely because it mentions payments, users or certificates. Hidden is a moderation state, not an intent label. Human replies, AI-generated answers and acknowledgments remain in the corpus with their record kind; do not relabel them as new learner questions or SME answers. Consolidate duplicate reposts without deleting their source lineage. Keep whole threads and duplicate groups in the same evaluation split.

Write a release candidate with only reviewed rows and reviewed fictional profiles. Record excluded/quarantined counts, source coverage, extraction time, scope, hidden-state coverage, and both privacy and routing review status. Publish only reviewed content within the user's existing sharing authorization. Missing or unreviewed rows must be reported, not silently counted as a complete public dataset.

Use the sample in `../../datasets/real-world/` immediately when no database is connected. It contains 40 real discussion queries, not a complete database export. The archived Slack feed lacked hidden status and included a webhook rate-limit notice; it cannot prove database completeness.

After ingestion, use `../build-golden-set/SKILL.md` for the separately triggered SME step. Keep the default 20-seed + 200-synthetic lesson intact. Provide support and tutor coverage and separate scorecards; do not add the entire corpus to the benchmark without a new trigger and a cost estimate.
