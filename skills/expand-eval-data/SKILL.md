---
name: expand-eval-data
description: Ask the user for expansion goals and settings, then expand their selected tutor golden set using a product matrix, parameterized scenarios and controlled LLM variations.
---

# Generate 10x synthetic cases

Read `../../references/lab-contract.md` and `../../references/eval-spec.md`. Trigger only the requested expansion stage; do not run the benchmark yet.

## Required interactive intake — ask, then wait

Start a new expansion by asking the user for inputs. Do not assume the golden-set intake also answers the synthetic-generation questions. Read saved settings only to propose defaults. Do not generate variants or finalize the product matrix until the user has answered. Silence, elapsed time, a preselected option or simply invoking this skill is not acceptance.

Ask in two short batches of up to three, with suggested answers and free-text alternatives. Use the IDE's question tool if available; otherwise ask in chat and stop the turn to wait. Let the user explicitly say “use all proposed defaults.”

First batch:
1. **Which seed file/version should we expand?** Show the available set's path, count and SME-review status. Suggested: the latest approved golden set. If only drafts exist, ask whether to wait for SME review or run an explicitly unvalidated teaching expansion; never call drafts approved.
2. **How many additional queries do you want?** Suggested: 200 from 20 seeds, ten per seed. For a different seed count, propose 10x and show the resulting total including originals. Ask whether allocation should be even or emphasize selected topics/failures.
3. **Which variations and failure modes should we target or avoid?** Offer paraphrases/typos, concise or frustrated wording, worked examples, changed problem constraints, missing/conflicting evidence, misleading premises, citation pressure and instruction injection. Ask for any custom scenario. Suggested: balanced coverage of the listed categories.

Second batch:
4. **How should we generate and mix the variants?** Offer parameterized templates, LLM-generated wording, or a hybrid. Suggested: hybrid with four phrasing variants, four changed-scenario/evidence variants and two adversarial variants per seed. Reconcile the allocation with the user's chosen count; do not force the sample matrix over their choices.
5. **What boundaries should the variants stay within?** Ask about language, single/multi-turn, text/image output and source scope. Suggested: the original language, single-turn text, existing checked source snapshot and no new topics. Additional sources, languages, multi-turn tasks or images need the user's selection and appropriate review; do not add them silently.
6. **How should changed expected answers be handled?** Suggested: assistant drafts revised expectations for SME review; alternative: SME writes them. Ask for any must-preserve behavior or rubric constraint. Generated expectations are not independent ground truth or automatic SME approval.

Reuse explicit answers already given for this expansion request without repeating questions. Present earlier-run settings for reuse or change. Ask unresolved items and wait. After the user answers, summarize the chosen count, seed version, variation mix, boundaries and reference-writing mode; save artifacts/synthetic-intake.json with status=user_confirmed and the actual answers. Then generate using those settings without another generic permission question.

No profile/persona questions or persona-based variants. This interview concerns the query and its evidence, transformations and expected behavior.

## Generate from the selected inputs

The classroom default is 20 seeds and 200 **additional** queries, but the user's confirmed count and allocation govern this run. Keep family, available source lineage, original timestamp and split. Every approved tutor seed needs checked educational evidence. Preserve parent query provenance and source links; deliberately missing-evidence variants must be labeled as failure/clarification scenarios, never supplied with invented citations. Synthetic creation time is a separate field; generated variants do not become recent learner traffic.

Build `product-matrix.csv` first. Useful axes: query topic; goal/intent; task constraints; source availability (present/missing/stale/conflicting); phrasing; tone; language; single/multi-turn; requested output (short explanation/procedure/image). Do not enumerate the whole Cartesian product blindly. Mark invalid combinations and choose cases for coverage and failure discovery.

Proposed default allocation per parent, used only when the user selects it:

- 4 meaning-preserving phrasing/noise variants: conversational, terse, frustrated, typo or differently ordered wording.
- 4 parameterized scenarios: a relevant missing detail, explicitly changed prerequisite knowledge or problem constraints, missing evidence and conflicting evidence. Choose parameters meaningful for the parent; avoid nonsensical cross-products.
- 2 boundary/adversarial cases: misleading premise or stale-source pressure, and instruction injection or pressure to invent a technical fact.

Use the selected generation method; a hybrid uses deterministic parameterization for boundaries and an LLM for natural phrasing. Change language only when requested and a competent SME/judge can review it. Multi-turn and image tasks may be added as a separately named extension set when selected. Version any user-requested deviation from the default 220-case classroom benchmark explicitly.

For each generated row record the exact matrix cell and transformation. Preserve the expected answer only when meaning and supplied evidence are unchanged. Changed state, missing sources, contradictory explanations or a new goal require revised expected behavior and SME review. Never use a generator's own judgment as independent proof that its answer is correct.

Deduplicate against seeds and siblings by the full case (query + task constraints + evidence fixture), including semantic near-duplicates. The same question with empty versus complete evidence is a distinct test; an identical question with identical state is not. Review whether the query is natural, the scenario is possible, required evidence exists, and the expected behavior follows. Export rejects separately and generate replacements until the confirmed number of usable candidates remains (default 200); don't pad with punctuation changes. Mark candidates as draft until reviewed. Record the intake file, seed version, model, prompt version and sampling parameters.

Outputs: `synthetic-queries.draft.csv`, combined `benchmark.draft.csv`, product-matrix CSV and generation report with coverage, reject counts, changed-answer counts and review queue. Promote only reviewed rows into the frozen benchmark; if an intended demo uses unreviewed rows, label that fact in the scorecard. Show original → two equivalent variants → one changed scenario with its changed expectation. Stop at checkpoint 3.
