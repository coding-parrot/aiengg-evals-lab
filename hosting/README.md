# Hosted classroom adapter

Public endpoint: https://aiengg-evals-lab.gkcs.chatgpt.site

Students use `tools/lab.mjs` in the repo. `worker.mjs` implements the same v0 prompt and lexical retrieval as the Node gateway, plus the typed judge adapter. `tools/build-hosted-worker.mjs PATH` embeds the source cards, prompt, optional HTML UI and Decisions mappings into a dependency-free Worker source tree. The target needs its own Sites `.openai/hosting.json` before building/publishing.

The deployed Worker calls a protected server relay that already has the instructor's OpenAI key. The relay source is `relay-route.ts`; it is a Next/Vinext route and uses the host's `setting(name)` and `database()` server helpers. It does not return or copy the provider key. Apply `relay-schema.sql` through the host's migration system before enabling requests. The deployment uses an atomic D1 allowance of 20,000 provider calls and 120 calls per minute across the entire class, including unsuccessful provider calls. These are call limits, not a dollar budget.

Worker runtime secrets: `STUDENT_API_KEY`, `RELAY_SECRET`, `RELAY_PLATFORM_TOKEN`. Worker configuration: `RELAY_URL`, `AGENT_MODEL`, `JUDGE_MODEL`. The existing private host stays private; the platform token authenticates only the server relay connection. Never expose these relay credentials in the repo or student connection file.

Relay settings: existing `OPENAI_API_KEY`, `AIENGG_EVAL_RELAY_SECRET`, `AIENGG_EVAL_AGENT_MODEL`, `AIENGG_EVAL_JUDGE_MODEL`, `AIENGG_EVAL_MAX_CALLS`; optional `AIENGG_EVAL_PAUSED=true` blocks new requests after deployment. Rotate `STUDENT_API_KEY` on the public Worker to revoke the shared class key. Rotate both relay secrets together if needed.

The deployed Worker uses D1 quotas via the relay. `tools/cohort-server.mjs` is a separate self-hosting option with its own file-based ledger; its pause/admin commands do not control the hosted relay. See `references/live-service.md` for actual verification, including unavailable measurements.
