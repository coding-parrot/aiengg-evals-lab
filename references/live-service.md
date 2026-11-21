# Live classroom service

**Public API origin: https://aiengg-evals-lab.gkcs.chatgpt.site**

Already configured in `config/classroom.json`. Clone/open the repo in Claude, Codex or your IDE; run `node tools/lab.mjs connect`, enter the shared student key, then run `doctor` and `ask "QUESTION"`. No browser, individual invitation, provider account or student OpenAI key is required. Node 22+ is needed; these helpers have no npm dependencies.

Verified on 22 November 2026 (Asia/Kolkata), with real network requests from the terminal:

- Public `/health` returned 200 without a login or platform cookie.
- Shared student key authenticated `/api/info`; an invalid key returned 401.
- Packaged v0 generated actual answers through the instructor's existing OpenAI key.
- The three-case draft benchmark completed with real OpenAI Decisions probabilities for answer relevance, tone and retrieved-context relevance.
- The CLI accepted hidden key input, saved the connection locally, and saved actual answer traces.

The three cases all failed the original universal citation check. That smoke output predates the updated tutor-only rule: these support cases are now N/A for citation presence, and those old citation failures must not be counted in current scores. Preserve the raw evidence and rerun scoring under a versioned rubric. These are observed starting-bot failures, not a validated full benchmark or an improvement claim. Raw probabilities are uncalibrated; sample references still need SME approval. See [the saved smoke outputs](../samples/deployment-smoke/). The full 220-case benchmark and v1 comparison remain classroom checkpoints.

Serving latency and token usage are recorded. Serving cost and TTFT remain unavailable in this non-streaming hosted adapter; they are not zero. Complete claim extraction is needed before reporting whole-answer faithfulness. Image quality and storyflow apply only when those outputs exist. LangSmith monitoring still requires instructor configuration at its checkpoint.

The public Worker uses the frozen starting prompt/source cards and a protected server relay with an existing OpenAI key. The provider key stays server-side. Durable limits are class-wide: 20,000 provider calls overall, 120 per minute; judge calls and unsuccessful provider requests count. These limits are not a dollar budget or uptime guarantee. Hosted source and operator controls are described in [hosting/README.md](../hosting/README.md).

The shared student key is distributed separately by the instructor and is intentionally absent from Git. Its saved local file, `config/student.connection.local.json`, is ignored. Keep the relay/provider secrets private.
