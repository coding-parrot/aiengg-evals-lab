# Pack validation

Checked on 22 November 2026.

- The original five evaluation SKILL.md files pass the skill format validator; the discussion-import skill is also included.
- Six local tests pass: valid/missing/forged citations, 20/21 sentence boundary, bullet counting, unknown cost/latency handling, CSV quoting, calibration holdout independence and missing-label/family-leakage rejection.
- Dataset checks pass: 20 seed rows, 200 synthetic rows, 220 unique IDs, valid parent links, preserved source dates and no family crossing calibration/validation. There are 18 underlying incident families because two seeds share an incident with another seed.
- Browser test passes for intake defaults, custom-query entry, JSON download and mobile layout width. The intake and SME review workbook were visually inspected.
- Sources are sanitized and references remain explicitly unreviewed. The shared pack excludes the private source register.

Not executed: paid bot/model calls, live OpenAI Decisions or Jev scoring, Laya inference, vision scoring, LangSmith publishing, alert delivery or cloud deployment. The helper APIs follow reviewed official documentation, but live integration must be smoke-tested with the selected versions and credentials. See the tool contract for implemented versus assistant-built integration paths.

The learner runs the lab through their coding assistant. The initial v0 bot is implemented and packaged; the assistant runs it, creates v1 from observed failures, and completes later integrations guided by the skills.

## Packaged v0 and shared OpenAI access

- Implemented the v0 support bot, lexical retrieval, browser UI, Responses generation and Decisions judge gateway. Students do not build v0. Startup checks frozen prompt/source hashes; improved prompts are separate overrides marked `v1_candidate`.
- The default backend needs one instructor OpenAI key. No TypeSafe key is needed for Decisions. Invitation tokens, quotas and server keys stay out of Git; container build exclusions protect local secrets.
- Twenty local tests pass, including access control, expiry/revocation, durable call limits, pause/rate limits, fixed upstream endpoints, default prompt preservation, typed probability/refusal mapping, and the three-case benchmark path using only classroom access.
- Provider transport in tests is deliberately mocked: these checks validate the implementation, not live model outputs or paid account access. Live Responses/Decisions smoke testing, hosted deployment and LangSmith integration await instructor configuration. No service URL is claimed.
- The starter endpoint reports missing full-claim extraction, streaming TTFT and unconfigured cost rates as unavailable. It does not silently manufacture complete quality scores. Image generation and production monitoring remain later checkpoints.

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

## Shared student API key

- Default documented access is one public URL plus one shared student API key, with no individual invites or student provider keys. Browser and IDE helpers use the same backend.
- All 21 local tests pass, including shared-key bot/judge access, rejection of legacy invites in shared mode, and a shared persisted call ceiling. These use mocked provider transport; live deployment is not claimed.
- A generated student key is in the operator’s ignored local environment and separate private handoff file. Provider keys and the generated student key are excluded from Git.
