# Real discussion data with fictional profiles

Students can use this folder without Slack or database access.

| File | Contents |
|---|---|
| [discussions.sample.json](discussions.sample.json) | 40 real discussion queries: 20 customer support and 20 AI tutor |
| [discussions.sample.csv](discussions.sample.csv) | The same 40 records for inspection in a spreadsheet |
| [discussions.sample.jsonl](discussions.sample.jsonl) | One JSON record per line for ingestion |
| [fictional-profiles.json](fictional-profiles.json) | 38 invented profiles; related selected messages retain the same classroom profile |
| [evidence.json](evidence.json) | Selected, redacted staff-thread excerpts for the original 20 support seeds in `samples/` |
| [manifest.json](manifest.json) | Scope, counts, review state and file hashes |

## What is real

The 40 query texts come from actual InterviewReady discussion notifications. HTML and person mentions were removed; the remaining wording, including errors and frustration, is preserved. The route labels were reviewed by the assistant. They are not SME-approved gold labels. Names and contact details in the profile file are entirely fictional; `example.invalid` addresses are non-delivery placeholders. No real identity mapping is included.

The staff excerpts are a different source type: internal reports about incidents, not direct customer conversations. They include selected original wording with redactions and are not complete transcripts. Their later resolution replies are for instructor analysis; do not add those replies to a frozen baseline retrieval snapshot without versioning the dataset. A historical fix is not evidence that a new user's account has been fixed.

## What is not included yet

This is a curated 40-query starter sample, **not all database discussions**. We enumerated 2,949 Slack feed events from 22 November 2024 through 21 November 2026: 2,946 discussion notifications and 3 non-discussion events. Of the discussion notifications, 779 were marked AI Assistant. Those AI replies were not selected as learner queries. The feed included a webhook rate-limit notice, so it cannot prove complete coverage of the database.

Current hidden/visible state is unavailable in Slack and is `unknown` on every sample row. We have not claimed these are hidden records. The database import is prepared but awaits the local connection file. It will read all history including hidden rows; the latest-two-years preference applies later when selecting the golden set.

## Use in the lab

> Read datasets/real-world/README.md and references/discussion-import.md. Load the 40 real queries and fictional profiles. Show five support and five tutor cases, then build the router and both agent routes using the supplied starting prompts. Keep expected labels out of the agent input. Retrieve approved support sources for support, and relevant lesson transcripts or papers for tutoring. Ask an SME to write expected answers before calling this a golden set. Stop before running the benchmark.

`expected_response` is deliberately null. The dataset has real questions, not fabricated SME answers. Some tutor questions refer to an unseen lesson diagram; supply the relevant lesson or ask for clarification. The existing support benchmark helper cannot score these rows as a validated benchmark unchanged: first create reviewed golden-set rows with evidence, applicability and required behavior using the skills.

Fake names, source month and visibility are metadata. They are not routing features or evidence for an answer. Exclude route labels, reviewer metadata and expected answers from bot inputs. Track routing accuracy and quality separately for support and tutor. The original 20 + 200 support lesson remains available unchanged.

For the full import, read [the import skill](../../skills/import-discussions/SKILL.md) after adding the private connection file.
