# Read-only tutor-query import

The active tutor dataset contains 1,153 query candidates with exact UTC timestamps. It has no profile/persona columns. Hidden database discussions can be added after the private connection is supplied.

The database connection is **pending**. Copy `config/database.connection.example.json` to `config/database.connection.local.json` locally, or give your coding assistant the location of an existing connection file. Keep its password in the named environment variable or your existing secret provider. The local file and `private-data/` are gitignored. Do not paste secrets into chat or commit them.

Trigger:

> Read skills/import-discussions/SKILL.md. Use my local database connection file. Discover the schema and export all discussions and replies, including hidden records, through a read-only connection. Keep raw data private. Scrub PII, exclude operational requests and non-query replies, strip author/profile fields, and show tutor-query coverage and the sanitized release candidate. Do not modify production discussions or run model evaluations yet.

## What is implemented

`tools/prepare-discussions.mjs` is an executable normalizer, initial scrubber, private identity scrubber and review-candidate builder. It consumes a canonical JSON export and writes only inside `private-data/`. It preserves every input row and rejects duplicate IDs, missing parents and invalid visibility rather than silently dropping them. Routing is a preliminary suggestion, not a semantic judge.

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

Remove author/profile/persona fields from public output. Internal identity mapping is for privacy review only. Preserve technical meaning while removing contact details, private URLs, payment/account identifiers, authorship clues and identifying contextual details.


## Tutor-only release

The private importer retains all rows for reconciliation; only reviewed tutor questions enter the public dataset. Use tools/tutor-scope.mjs to select candidates, then inspect actual learning intent and remove identifying context. Exclude operational and mixed-intent problems. Source links belong to educational evidence and must be checked before approving seed references. Do not build a router or a second agent for this lab.
