# Tutor lab verification

Verified on 22 November 2026 (Asia/Kolkata).

- 26 local tests pass: privacy import invariants, exact timestamp handling, dataset scope/lineage, family splits, citation syntax/mapping, sentence limits, calibration leakage, access control, quotas, frozen v0 hashes and CLI connection.
- Active corpus: 1,153 tutor query candidates with no profile/persona fields. Twenty seed queries match the sanitized originals and their exact timestamps.
- Exactly 200 additional variants, 220 unique case IDs, ten variants per seed, no family split leakage. Every seed maps to checked educational resources.
- Packaged tutor prompt and source cards match the frozen manifest. Its basic prompt has no citation guardrail or sentence-limit enforcement.
- Public /health and student /api/info work without a browser or platform login. /api/info identifies tutor_only and the current baseline ID.
- Actual tutor answers and typed Decisions results completed for three draft cases. The returned prompt hashes match the tutor manifest. Saved under samples/deployment-smoke/.
- Local Markdown links resolve. Intake JavaScript syntax checked; the form is optional and contains no profile fields.
- CSVs preserve original query whitespace and timestamp precision. Any trailing whitespace inside quoted query cells is source text, not a formatting fix.
- Sample references remain assistant drafts; they are not SME approval or calibrated labels.

Not claimed: a completed 220-case calibrated benchmark, measured v1 improvement, whole-answer faithfulness without claim extraction, streaming TTFT, dollar cost without rates, image judging without images, or installed LangSmith alerts. These remain their respective classroom checkpoints.

Deployment verification is separate from checkpoint 0. The student starts with tutor answers only; no judge runs automatically.
