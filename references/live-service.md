# Live tutor service

**Public endpoint: https://aiengg-evals-lab.gkcs.chatgpt.site**

Already configured in config/classroom.json. Use node tools/lab.mjs connect, doctor and ask directly from Claude/Codex/your IDE. The existing shared student key still works. No browser or provider key is needed.

Verified on 22 November 2026 (Asia/Kolkata):
- Public health succeeds without a platform login.
- Student API info reports tutor_only and baseline aiengg-tutor-v0-2026-11-22.
- Actual tutor generation and typed OpenAI Decisions judging completed for three draft cases.
- Returned prompt hashes match config/v0-manifest.json.
- Real traces and uncalibrated scores are in [samples/deployment-smoke](../samples/deployment-smoke/).

The active pack is tutor-only and query-first. Prior domain traces were replaced; do not compare them to these scores as a v0/v1 improvement.

Packaged v0 has no runtime source/citation enforcement and does not run evals automatically. The deployment smoke is operator verification. Students define evals with the SME, then measure v0 and introduce the guardrail in v1.

Serving latency and token usage are recorded. TTFT and unpriced dollar cost remain unavailable. Faithfulness needs complete claim extraction; image scores need actual images. LangSmith remains the later monitoring checkpoint.

The protected relay reuses the instructor's existing OpenAI key. Durable class-wide limits remain 20,000 provider calls total and 120/minute, including judge and failed requests. These are call limits, not a dollar budget. See [hosting](../hosting/README.md) for operator controls.
