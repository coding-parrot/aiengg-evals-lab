# Show an actual before/after change

**Starting bot (`v0`)** is the initial application, using `prompts/support-starting-system.txt`. **Improved bot (`v1`)** is a separately saved application version after acting on evaluation findings. These labels are application versions, not different model generations.

Evals measure behavior. Changes to the prompt, retrieval or tools change behavior. The demonstration should show the complete connection: observed failure → targeted change → repeated measurement.

## 1. Freeze the starting point

At checkpoint 0, load the starting prompt exactly. Save its hash, model ID, generation settings, retrieval configuration and source snapshot. Keep the three initial chat responses with their contexts and timestamps. Do not quietly strengthen the prompt while implementing the eval harness. Instrumentation may be added without changing what the bot sees.

“No evals yet” means performance is **unmeasured**, not 0%. After the dataset and judges are ready, evaluate this saved starting version on the full 220 cases. That is the starting score. Do not compare three easy opening examples with 220 harder final tests.

## 2. Inspect the failure pattern

Trigger `skills/analyze-errors/SKILL.md` to open-code actual failures, consolidate a taxonomy, and show the ranked error-frequency chart. Inspect severity, affected families and evidence before picking a fix. Its optional spider chart compares compatible metric scores; it does not establish root cause.

Open the original answer, retrieved evidence, SME expectation and each evaluator result side by side. Group failures by controllable cause. For example, an unsupported claim, missing citation, wrong course context and a 21-sentence answer require different fixes.

Choose one or two failure clusters with meaningful severity and coverage. Record the proposed change before measuring the improved version. Avoid adding instructions simply because they appear in the rubric when the bot has not demonstrated that problem.

## 3. Make the first comparison easy to interpret

Create `prompts/support-improved-system.txt` from the observed prompt-related failures. Keep the same LLM, model version, temperature, token limit, tools and retrieved evidence fixtures. Replay the same retrieved context for each paired query so the first experiment isolates the prompt change.

Example only: if the starting bot repeatedly omits sources, the improved prompt may require a visible citation tied to provided evidence. If it interprets an old incident fix as a current guarantee, add rules about evidence dates and verifying current status. Do not teach invented remedies for failures the experiment did not observe.

In a later experiment, allow retrieval or tool changes while preserving the query set and source snapshot. Label that comparison “whole-agent improvement”; report which components changed. Do not attribute the whole effect to the LLM or system prompt alone.

## 4. Rerun the same measurement

Use the same frozen dataset, calibrated judges, thresholds, code checks, budgets and weighting. Prefer 3 repetitions for both versions; keep their run counts equal. Include failures and timeouts. If a model alias resolves to a different version, stop the paired claim and rerun under controlled versions.

Do not reuse the starting version's answers as the improved version's answers. Both must execute. Judges receive actual outputs and relevant evidence. They do not receive a “before” or “after” label that could bias a score.

The comparison report must include:

| Evidence | What to display |
|---|---|
| Same query | Starting and improved answers side by side, with source context |
| Quality | Each metric's pass rate, denominator and change in percentage points |
| Cost and latency | Cost per answer, total serving/evaluation spend, TTFT and p50/p95 latency |
| Regressions | Cases that passed before and failed afterward, not just wins |
| Stability | Repetition-level outcomes and errors |
| Provenance | Prompt diff, model/settings, source/dataset/judge hashes |
| Scope | Originals versus synthetic; calibration-exposed versus held-out families |

Leave scores blank until real execution. Report no improvement or a tradeoff when that is what happened. If the starting bot already performs well, show a separately named controlled regression experiment rather than deliberately weakening its baseline after seeing results.

## 5. Interpret the result correctly

The improvement claim is about this frozen diagnostic benchmark. Cases inspected while fixing the bot become development/regression cases. Preserve new unseen families for an independent release test. Synthetic siblings are correlated, so uncertainty calculations resample parent families.

Production monitoring then checks whether the change holds on new traffic. Retention is monitored over mature user cohorts, not assigned by the judge to each response.
