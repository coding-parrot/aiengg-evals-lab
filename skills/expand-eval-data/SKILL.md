---
name: expand-eval-data
description: Expand an approved support golden set into a reviewable synthetic test set using a product matrix, parameterized scenarios and controlled LLM variations.
---

# Generate 10x synthetic cases

Read `../../references/lab-contract.md` and `../../references/eval-spec.md`. Trigger only the requested expansion stage; do not run the benchmark yet.

Use 20 approved seeds and produce 200 **additional** queries, 10 per seed. Read the saved intake. Keep family, source lineage, original timestamp and split. Synthetic creation time is a separate field; generated variants do not become recent customer traffic.

Build `product-matrix.csv` first. Useful axes: product; learner profile; goal/intent; account or entitlement state; source availability (present/missing/stale/conflicting); phrasing; tone; language; single/multi-turn; requested output (short explanation/procedure/image). Do not enumerate the whole Cartesian product blindly. Mark invalid combinations and choose cases for coverage and failure discovery.

Default allocation per parent:

- 4 meaning-preserving phrasing/noise variants: conversational, terse, frustrated, typo or differently ordered wording.
- 4 parameterized scenarios: a relevant missing detail, explicitly changed entitlement/status, missing evidence and conflicting evidence. Choose parameters meaningful for the parent; avoid nonsensical cross-products.
- 2 boundary/adversarial cases: misleading premise or stale-source pressure, and instruction injection or pressure to claim a successful action.

Use deterministic parameterization for known boundaries and an LLM for natural phrasing. Change language only if it is in the selected profile and a competent SME/judge can review it. Multi-turn and image tasks may be added as a separately named extension set when they do not fit the original support case. Do not silently alter the required 220-case baseline.

For each generated row record the exact matrix cell and transformation. Preserve the expected answer only when meaning and supplied evidence are unchanged. Changed state, missing sources, contradictory policies or a new goal require revised expected behavior and SME review. Never use a generator's own judgment as independent proof that its answer is correct.

Deduplicate against seeds and siblings by the full case (query + account state + evidence fixture), including semantic near-duplicates. The same question with empty versus complete evidence is a distinct test; an identical question with identical state is not. Review whether the query is natural, the scenario is possible, required evidence exists, and the expected behavior follows. Export rejects separately and generate replacements until exactly 200 usable candidates remain; don't pad with punctuation changes. Mark candidates as draft until reviewed. Record seed, model, prompt version and sampling parameters.

Outputs: `synthetic-queries.draft.csv`, combined `benchmark.draft.csv`, product-matrix CSV and generation report with coverage, reject counts, changed-answer counts and review queue. Promote only reviewed rows into the frozen benchmark; if an intended demo uses unreviewed rows, label that fact in the scorecard. Show original → two equivalent variants → one changed scenario with its changed expectation. Stop at checkpoint 3.
