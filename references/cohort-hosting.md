# Shared cohort backend: one instructor OpenAI key

The default uses OpenAI Responses for the support bot and **OpenAI Decisions** for the typed judge. Both use the instructor's existing `OPENAI_API_KEY`. No TypeSafe/Jev key is required. Everyone uses one shared student API key. No individual invitation, login or student OpenAI key is required. This is instructor-funded access, operator-funded inference with a separate shared lab access key.

The [Decisions API](https://developers.openai.com/api/docs/guides/decisions) returns typed predicates, choices and scores; the classroom adapter implements predicates and categorical choices, including the existing 0–4 storyflow choices. The documented supported model is `gpt-6-luna`. OpenAI does not identify it as an encoder-only model in that guide: teach it as a **typed decision judge**, not as a verified encoder architecture. Keep SME calibration and holdout testing.

## Student experience

**Browser:** open the public lab URL and enter the same shared student API key used by everyone. The hosted page can call the actual starting bot, show sources/usage/latency, call the judge when triggered, and download the trace. No install, provider signup or provider-key entry. It is the initial demonstration, not a complete web implementation of every SME, calibration, chart and monitoring checkpoint.

**Full IDE lab:** clone/open this repo and use “Connect my IDE” on the public lab page. Have the coding assistant place the downloaded `.env` in the repo root. It contains only `COHORT_URL` and the student's restricted `COHORT_ACCESS_TOKEN`. Helpers load it automatically on Node 22+. The assistant can then run the skills and generate the CSVs/charts without student OpenAI/Jev credentials. A local Node runtime and repo checkout are still required for this path; the browser path needs neither.

The operator shares the public URL and one common student key with everyone. The provider key remains server-side. Browser access persists in tab session storage; re-enter the common key to reconnect. The connection file contains only this lab key. Keep provider credentials separate.

## Instructor setup, once

1. Set `STUDENT_API_KEY` to the shared student key. Add your existing OpenAI key to the hosting secret environment as `OPENAI_API_KEY`, or copy `.env.example` to a private `.env` locally. Default generation and judge models are `gpt-6-luna`; generation can use another available Responses model. No secrets belong in Git or the Docker image.
2. Choose the HTTPS public origin in `COHORT_PUBLIC_URL`. The default local address is for instructor smoke testing only. For students outside your machine use a deployed HTTPS address. Bind `HOST=0.0.0.0` in a container; otherwise the default bind is loopback.
3. Set request ceilings appropriate to the cohort. Defaults: 20,000 provider calls overall, 5,000 per student, 120 per minute per student, four concurrent upstream requests, 24,000 input bytes and 1,200 output tokens. These are lifetime call limits, not dollar budgets. Provider billing caps and instructor cost estimates remain necessary for a specific monetary budget. Root/chunk/claim judges each consume calls; plan for repeated v0/v1 runs before raising limits.
4. Share the public URL and the same `STUDENT_API_KEY` with everyone. No invitation-generation command or student enrollment is needed. Shared mode uses one global allowance/rate limit across all users, not separate per-student quotas. Rotate the shared key in the server environment and restart to revoke the previous key.
5. Start `node tools/cohort-server.mjs`. Run a real three-case smoke test after credentials are available. Verify the account can access both Responses and Decisions; an API key alone does not prove credit balance or model access.

The coding assistant can perform these steps. Students do not repeat them. This repository does not include a deployed service, working keys or a prepaid account.

### Container deployment

The default student route is public URL plus shared student key. The supplied Dockerfile uses Node 22 and no npm dependencies. Build `docker build -t aiengg-evals-lab .`. Run one replica behind your HTTPS ingress with secrets supplied by the host and a persistent writable volume at `/app/private-data/cohort-state`. The Node process runs as the non-root `node` user; ensure the mounted directory is writable by it. Set the shared student key and OpenAI key in the hosting environment, then start the service. Do not run an unmetered second replica.

`GET /health` supports readiness checks. A state-directory lock refuses a second server process. After an ungraceful crash, confirm no server is running before removing a stale `server.lock` on the persistent volume. Do not delete `ledger.private.json`: that would reset quotas and invitation state. Back it up privately. This file-based single-instance design is intended for a cohort lab; a distributed deployment requires transactional shared quotas.

## Operation and stopping costs

- `node tools/cohort-admin.mjs pause` immediately blocks new provider requests via the shared state directory; already-running calls can finish.
- `node tools/cohort-admin.mjs resume` resumes within existing quotas.
- Stop the server before CLI ledger edits/status. Shared mode revocation means changing `STUDENT_API_KEY` and restarting; all previous shared keys are rejected. Individual invitations remain an optional legacy mode: omit `STUDENT_API_KEY` and explicitly set `COHORT_INDIVIDUAL_INVITES=true`; only that mode uses `invite` and per-student `revoke` commands.
- Quotas are reserved durably before upstream calls. Failed provider requests count conservatively; the server does not automatically retry paid requests.
- Only fixed OpenAI endpoints (or explicitly selected legacy Jev) are reachable. Students cannot override provider URLs, keys, model choice, token caps or tools. Custom system prompts are allowed for the learning exercise and billed to the same limited allowance.
- Keys and request bodies are not logged. Error responses contain status information, not upstream secret-bearing bodies. Do not enable proxy logging of Authorization headers or invitation fragments.

If the optional input/output price environment values are absent, `cost_usd` is null. Set rates from a dated official price sheet to estimate serving cost; usage discounts/caching may differ, so reconcile against provider billing. TTFT remains unavailable because this starter endpoint is non-streaming. Never present unknown measurements as zero.

## How the full lab connects

`tools/benchmark.mjs` detects the classroom `.env`, calls `/api/bot` and scores responses through `/api/judge`. `tools/judge.mjs` uses the same connection for calibration. No `BOT_ENDPOINT`, OpenAI key or TypeSafe key is needed on the learner machine. Direct instructor mode remains supported.

The shared starting bot uses the default system prompt verbatim and simple lexical retrieval over sanitized source cards. It never receives golden answers or eval labels. To test an improved prompt, save it to a separate file and set `COHORT_PROMPT_FILE` locally; both versions use the same endpoint and retrieval. Custom agents can call `/api/generate` with `{input, instructions}` through `cohortCall` in `tools/env.mjs`. Record prompt/model/source hashes and preserve the baseline.

The starter endpoint does not extract complete material claims, stream tokens, generate images or publish LangSmith traces. Those remain explicit assistant-built checkpoints in the lesson. Faithfulness is unavailable until the claim extraction/coverage step is implemented; the benchmark preserves that status. The browser's two-question judge demo is not the full calibrated suite. No performance gains or production deployment are implied by running the gateway.

For hosted tracing/monitoring later, add the instructor's `LANGSMITH_API_KEY` and follow the monitoring skill. It is not required to run the bot and Decisions judge, and students still need no provider accounts. Native Jev in LangSmith is an optional alternative and requires TypeSafe credentials; see [LangChain's setup](https://www.langchain.com/blog/jev-is-now-available-in-langsmith-evals). TypeSafe currently says it offers [no free/trial credits](https://help.typesafe.ai/articles/5187202169-how-much-does-jev-cost), so the default does not depend on a free Jev key.
