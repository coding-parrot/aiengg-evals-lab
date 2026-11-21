# Database import and the two agent routes

All 2,946 collected Slack discussion notifications are already published in `datasets/real-world/slack/`, with fictional profiles, exact UTC notification timestamps and support/tutor partitions. See the [dataset guide](../datasets/real-world/README.md). The database step below adds hidden-state coverage and source relationships later; it is not needed to use the shared Slack dataset.

The database connection is **pending**. Copy `config/database.connection.example.json` to `config/database.connection.local.json` locally, or give your coding assistant the location of an existing connection file. Keep its password in the named environment variable or your existing secret provider. The local file and `private-data/` are gitignored. Do not paste secrets into chat or commit them.

Trigger:

> Read skills/import-discussions/SKILL.md. Use my local database connection file. Discover the schema and export all discussions and replies, including hidden records, through a read-only connection. Keep raw data private. Prepare fictional profiles and scrub all PII. Review routing into customer support and AI tutor, then show coverage and the sanitized release candidate. Do not modify production discussions or run model evaluations yet.

## What is implemented

`tools/prepare-discussions.mjs` is an executable normalizer, initial scrubber, fictional-profile generator and review-candidate builder. It consumes a canonical JSON export and writes only inside `private-data/`. It preserves every input row and rejects duplicate IDs, missing parents and invalid visibility rather than silently dropping them. Routing is a preliminary suggestion, not a semantic judge.

The coding assistant connects using the selected database's existing client/driver, discovers the schema, and builds the read-only export query after the connection file arrives. The repository does not guess your database type, credentials or tables. Database connection, database source-count reconciliation, review and release of database-only records remain pending. Reconcile the export against the existing Slack corpus privately before appending records; do not count both the database row and its Slack notification as separate incidents.

## Canonical export

Supply a JSON array with these fields; normalize actual database column names before invoking the helper:

```json
[
  {
    "id": "source-discussion-id",
    "parent_id": null,
    "author_id": "source-author-id",
    "author_display_name": "Source name for private redaction only",
    "author_role": "learner",
    "created_at": "2026-11-01T00:00:00Z",
    "is_hidden": true,
    "body": "Original comment, including HTML if present"
  }
]
```

`author_role` is `learner`, `staff`, `ai` or `unknown`; never infer a human from an absent AI flag. `is_hidden` is true, false or null (unknown). `parent_id` must resolve within the export, otherwise retrieve the parent or explicitly resolve the export gap. Do not silently discard hidden parents. Empty bodies remain as flagged rows. Preserve `created_at` as an ISO 8601 string with an explicit timezone and all available fractional digits; the helper retains it exactly with `timestamp_kind=database_created_at`. If the database stores timezone-naive values, verify the database timezone before conversion. Month buckets are additional metadata, not a replacement for timestamps. Original identifiers and names live only in the private identity map. No phone, email or real demographic fields are needed in the export.

The export is **all history**, while later golden-set selection can use the latest two years and a 180-day recency half-life. Keep source counts, IDs and extraction boundaries in a private audit manifest. If table access or deleted records prevent full coverage, state that limitation.

## Review and release

For previously collected Slack notifications, `tools/build-slack-dataset.mjs` builds a private candidate from `{ts,date,author,content}` records and an optional private per-record review file. The published release has been processed and checked separately. This tool does not fetch Slack, infer hidden status, or automatically publish data. Never copy its `identity-map.private.json` into the public dataset.

The helper produces `private-data/discussion-import/candidates.json`, `profiles.json`, `identity-map.private.json` and `manifest.json`. Review all content, routes and thread/group relationships before copying any candidate into `datasets/`. Pattern-based redaction alone does not establish anonymity. Do not turn `privacy_review=pending` into approval without inspecting the text. Keep quarantined content private and report its count.

Use fictional names and `example.invalid` contact addresses; do not invent plausible real phone numbers. Profile attributes are fictional teaching aids, never recovered demographics. Preserve technical meaning while removing contact details, private URLs, payment/account identifiers, authorship clues and identifying contextual details.

## Support and tutor behavior

Use `prompts/discussion-router.txt` to route new learner queries, and score routing separately against reviewed route labels. Route intent without access to the expected route, hidden flag, expected answer, or reviewer notes. Retain mixed cases with an explicit secondary route.

- Customer support uses `prompts/support-starting-system.txt` and verified support evidence/tools.
- AI tutor uses `prompts/tutor-starting-system.txt` and approved lesson transcripts, research papers and retrieval results. Existing discussion replies and AI answers are not ground truth.
- A complaint about a missing video belongs to support; a question about video-streaming architecture belongs to the tutor.
- A factual course error can require a tutor explanation plus a support/content-correction handoff.

Both routes use the existing citation, faithfulness, relevance, polite-tone, sentence-limit, latency and cost metrics. Tutor references and rubrics must be written or approved by an SME. Context-dependent questions need their lesson context; without it, the expected behavior can be asking a useful clarification. Storyflow/image scoring remains conditional. Monitor retention only in production.

Keep the original support-only v0/v1 comparison unchanged. Establish a separate frozen baseline for the expanded router + tutor application; compare each route and routing accuracy, not just one blended number.
