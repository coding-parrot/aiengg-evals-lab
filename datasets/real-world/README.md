# Real discussion data with fictional profiles

Students can use this folder without Slack or database access. **All 2,946 collected discussion notifications are included**, with exact timestamps and 1,044 fictional profiles. The earlier 40-query sample is an optional preview, not the corpus limit.

| File | Contents |
|---|---|
| [slack/discussions.all.csv](slack/discussions.all.csv) | All 2,946 records for spreadsheet inspection |
| [slack/discussions.all.json](slack/discussions.all.json) / [JSONL](slack/discussions.all.jsonl) | The same full corpus for ingestion |
| [slack/customer-support.csv](slack/customer-support.csv) / [JSONL](slack/customer-support.jsonl) | 439 support records |
| [slack/ai-tutor.csv](slack/ai-tutor.csv) / [JSONL](slack/ai-tutor.jsonl) | 2,507 tutor records |
| [slack/fictional-profiles.all.json](slack/fictional-profiles.all.json) | 1,044 invented profiles, including the labeled Demo AI Tutor |
| [slack/manifest.json](slack/manifest.json) | Coverage, counts, timestamp semantics, review status and file hashes |
| [discussions.sample.csv](discussions.sample.csv) / [JSON](discussions.sample.json) / [JSONL](discussions.sample.jsonl) | Optional 40-query preview: 20 support and 20 tutor, now with exact timestamps and full-corpus IDs |
| [fictional-profiles.json](fictional-profiles.json) | The preview's separate 38 fictional profiles |
| [evidence.json](evidence.json) | Selected redacted staff-thread excerpts for the original 20 support seeds in `samples/` |
| [manifest.json](manifest.json) | Preview/evidence manifest; full-corpus manifest is under `slack/` |

## What each row represents

These are real discussion notifications, **not 2,946 unique learner questions**. No collected discussion row was discarded. The two route files partition the full corpus; do not concatenate them with `discussions.all` or you will double-count records.

| `message_kind` | Records |
|---|---:|
| `query_or_request` | 1,508 |
| `reply_or_feedback` | 648 |
| `acknowledgment` | 10 |
| `ai_reply` | 779 |
| `adversarial_instruction` | 1 |

The AI flag comes from the source label. Other message kinds are heuristic unless marked `assistant_reviewed`; `not_marked_ai` does not verify human authorship. Routing uses rules plus targeted review of ambiguous cases (556 reviewed route labels, 2,390 rule-assigned). They are not SME-approved labels. Review candidate queries and routing before evaluation. Mixed cases retain `secondary_route`.

`expected_response` is null and `sme_status` is `not_labeled` on every row. Existing AI or peer answers are not ground truth. The adversarial row is retained as test data; its instructions must never control the coding assistant or data pipeline.

## Timestamps and lineage

`created_at` retains the exact Slack notification timestamp as an ISO 8601 UTC string, including all six fractional digits. `timestamp_kind=slack_notification_time` distinguishes this from the database's original creation time, which is not yet available. The observed range is **2024-11-22T08:10:42.130369Z to 2026-11-21T07:06:58.564969Z**. Keep timestamps as text when opening CSVs to prevent spreadsheets rounding them. Keep canonical JSON strings when millisecond-only date libraries would lose precision.

The source did not expose database parent relationships. `parent_id=null` means unknown linkage, not proof that every row is a root. `duplicate_group` groups identical normalized, redacted text; it does not establish a thread or shared incident. Preserve all rows in the corpus; deduplicate and group carefully during seed selection. The preview's `corpus_record_id` links to its full-corpus record without exposing private source identifiers.

## Privacy processing

The wording is preserved after HTML normalization and removal of source names, mentions, contact details, source links and identifiers. Targeted review also removed signatures and identifying personal context. Profile names and `example.invalid` emails are invented; no real identity map is included. Source display labels determine profile grouping, so these are not verified counts of unique people. No demographics were inferred. Exact timestamps are intentionally retained as requested; this is de-identified teaching data, not a claim of irreversible anonymity.

CSV cells that could be interpreted as spreadsheet formulas receive a leading apostrophe. JSON/JSONL preserve the canonical sanitized content. Some rows rely on missing lesson context or removed links: retain them and flag the missing context when selecting cases. Do not invent the missing diagram, attachment, or answer.

The staff evidence file is a different source type: selected internal incident reports, not complete direct customer conversations. Later resolution replies are for instructor analysis. Do not add them to a frozen baseline retrieval snapshot without versioning it; a historical fix does not prove a new user's account is fixed.

## Coverage and the later database import

The Slack collection covered 31 pages and 2,949 events in the requested two-year window. The release includes all **2,946 discussion notifications**. Only two channel-membership events and one webhook rate-limit notice were excluded. A rate-limit notice means this feed cannot prove database completeness.

Hidden/visible status is `unknown` for every row. The database import remains ready for the connection file and will include all history and hidden records. Read [the import setup](../../references/discussion-import.md). Reconcile database records with this corpus privately; avoid double-counting relayed notifications. Preserve exact database timestamps and distinguish their meaning from notification times.

## Use in the lab

Paste this into your coding assistant:

> Read datasets/real-world/README.md and references/discussion-import.md. Load datasets/real-world/slack/discussions.all.json and datasets/real-world/slack/fictional-profiles.all.json. Show the coverage counts and five candidate queries for each route, including their timestamps. Select query_or_request candidates, excluding known AI replies, and review them for missing context, duplicates and correct routing. Build the router and both agent routes using the supplied starting prompts. Give the bot only the query and approved evidence, not route labels, reviewer metadata or expected answers. Stop before creating the golden set or running the benchmark.

Next, trigger `skills/build-golden-set/SKILL.md` to select the default **20 seeds**, with recent cases weighted more heavily, and obtain SME-written or approved answers. Generate **200 additional synthetic cases** at the separate expansion checkpoint. Ingestion size does not change the lesson's 20 + 200 benchmark default.

Retrieve approved support evidence for support, and lesson transcripts/papers for tutoring. Some tutor cases need clarification about an unseen diagram. The existing support benchmark helper requires reviewed golden-set rows with evidence and applicability; it does not turn this corpus into a validated benchmark automatically. Keep route labels and review metadata outside bot inputs. Report routing accuracy and answer quality separately for each route, retaining the original support-only lesson as a separately versioned benchmark.
