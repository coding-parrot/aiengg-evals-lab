---
name: calibrate-judges
description: Align focused Jev or Laya text judges and optional vision judges with SME ratings of actual support-bot outputs, using family-separated calibration and validation.
---

# Calibrate the judges

Read `../../references/lab-contract.md`, `../../references/eval-spec.md` and `../../references/langsmith-runbook.md`. Finish checkpoint 2 only.

Reference answers alone do not calibrate a judge. Run v0 on the approved seed queries and collect actual answers and retrieved context. Create plausible poor and borderline answers as calibration probes, labeled as generated probes. Include fluent unsupported promises, irrelevant but faithful answers, relevant answers with irrelevant retrieved chunks, bad citations, subtle rudeness, long answers and well-structured wrong answers. Include good paraphrases that differ from the reference wording.

Create a blind SME rating sheet in long form: one candidate × metric per row. Hide the bot/model identity and current judge score from the rater. Label provenance separately. Ask the SME to rate each binary dimension and applicable storyflow/image dimension using the anchored rubric. Do not fill human label cells with AI scores. Use a second rater/adjudication on ambiguous cases where available.

Split by original conversation/incident family, about 60/40 for this small lab. Keep candidates and paraphrases for the same family together. The golden set has only 20 queries; 60 candidate answers do not become 60 independent customer situations.

Default to Jev via the native LangSmith decision-model evaluator. Laya alternative: use an explicitly specified encoder checkpoint and pinned revision, not an unqualified package default. Record selected model, version/revision, runtime and context limit. Long evidence must be split into atomic claim/chunk evaluations; record truncation and fail the evaluation if necessary evidence was lost. Never treat truncated evidence as complete.

Create atomic judges for answer relevance, context relevance, claim support, citation support and polite tone. Storyflow uses the ordinal rubric. Code handles citation mechanics and the sentence cap. Image quality requires image bytes and a validated vision-capable judge or SME. Do not ask a text encoder to judge pixels.

Run the initial judges against the same frozen candidate outputs the SME rated. Show per-metric confusion tables, agreement, precision/recall for bad answers, false-accept rate, and disagreements. For probabilities, show Brier score and calibration bins where sample size permits. For ordinal dimensions show MAE and weighted kappa.

Tune rubric wording, examples, per-metric probability calibration and decision thresholds on calibration families only. Prefer catching unsupported answers over maximizing overall agreement. Predeclare the false-accept objective and keep the original rubric/version. Do not fine-tune a model automatically; the lab's default is rubric/threshold alignment. A fine-tuning extension requires suitable training data and a separate validation set.

Evaluate the frozen candidate judge once on held-out families. Show before/after performance on both partitions and the sample counts. If the judge is poor, keep it marked unvalidated and route disputed cases to SME review. Do not keep adjusting after inspecting holdout while still calling it held out.

Export `judge-labels.csv`, `judge-disagreements.csv`, `calibration-report.html` and `judge-config.json`. Include metric-specific thresholds, review bands, dataset hash and rubric/model versions. Do not conflate the model's confidence field with empirically calibrated reliability. Explain that this small teaching calibration is preliminary; production needs more independent labels, particularly for rare high-impact failures. Show the result and stop.
