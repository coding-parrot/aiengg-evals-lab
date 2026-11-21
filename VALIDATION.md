# Pack validation

Checked on 22 November 2026.

- The original five evaluation SKILL.md files pass the skill format validator; the discussion-import skill is also included.
- Six local tests pass: valid/missing/forged citations, 20/21 sentence boundary, bullet counting, unknown cost/latency handling, CSV quoting, calibration holdout independence and missing-label/family-leakage rejection.
- Dataset checks pass: 20 seed rows, 200 synthetic rows, 220 unique IDs, valid parent links, preserved source dates and no family crossing calibration/validation. There are 18 underlying incident families because two seeds share an incident with another seed.
- Browser test passes for intake defaults, custom-query entry, JSON download and mobile layout width. The intake and SME review workbook were visually inspected.
- Sources are sanitized and references remain explicitly unreviewed. The shared pack excludes the private source register.

Not executed: paid bot/model calls, live Jev scoring, Laya inference, vision scoring, LangSmith publishing, alert delivery or cloud deployment. The helper APIs follow reviewed official documentation, but live integration must be smoke-tested with the selected versions and credentials. See the tool contract for implemented versus assistant-built integration paths.

The learner runs the lab through their coding assistant. The assistant builds the initial bot and remaining integrations, while these skills define the stages and the files to inspect.

## Error-coding checkpoint

- Added `analyze-errors` with open coding, versioned taxonomy, draft/SME review, evidence-linked prioritization and proposed regression cases. Connected it to benchmark review, before/after improvement and production monitoring.
- The new skill and the two updated benchmark/monitoring skills pass the skill format validator. Chart instructions require ranked error-frequency bars, comparable optional radar axes, explicit denominators and honest empty states.
- These are reusable instructions for the coding assistant to execute on real run artifacts. No error labels, priority rankings or rendered performance charts are claimed before those artifacts exist.

## Real discussion data and pending database import

- Published all 2,946 collected discussion notifications: 439 support and 2,507 tutor records, including 779 source-labeled AI replies. No discussion records were excluded. The original 40-query preview and staff evidence remain available.
- Added 1,044 fictional profiles for the full corpus. Removed source names/mentions, contact details and source locators; targeted review covered signatures and identifying context. Corpus scans check known source names and contact/credential patterns. Private raw records, review overrides and identity mappings remain gitignored.
- Reconciled every public row to its private source notification and verified exact UTC timestamps with six fractional digits. The preview's 40 timestamps and corpus links were also verified. Checked unique IDs, profiles, all-row JSONL equality, support/tutor partitions, CSV round trips and SHA-256 hashes.
- Collection comprised 2,949 Slack events across 31 pages. Excluded only two membership events and one rate-limit notice. Slack coverage is not database completeness; hidden status and parent linkage remain unknown.
- Fourteen local tests pass: the original six, four database-preparation tests and four Slack-builder tests. Coverage includes precise timestamps, preserved AI replies, fictional identities, ambiguous routing overrides, spreadsheet formula neutralization, programming comparisons and small numeric tables.
- Routes and non-AI message kinds have honest per-row review flags; many remain rule-assigned/heuristic. Expected responses are null, with zero SME-approved rows. Review candidates before constructing a benchmark.
- Database schema discovery, read-only export, count reconciliation and review of database-only records remain pending the connection file. The importer now preserves exact database timestamps and explicit timezone rather than only month buckets.
