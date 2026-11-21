# Cohort lab instructions

Read `START-HERE.md` and follow the user's current stage. The v0 bot is already packaged in tools/cohort-server.mjs with cohort.html and config/v0-manifest.json. Start with that implementation; do not ask learners to build a baseline or replace it. Create v1 only after inspecting actual evaluation failures. This is an agent-driven lesson: implement and run the requested work, then show its files and observed output. Do not ask students to write code manually. Use the existing stack or TypeScript for a new project.

Use the skills by reading their `SKILL.md` files directly. Do not assume they are installed globally or that an IDE supports a particular slash command. Explicit file mentions are the portable entry point.

Keep the learner-facing checkpoint boundaries. Preserve data provenance and draft/SME status. Never present sample rows as exact customer quotes, assistant-drafted references as SME labels, raw judge probabilities as validated scores, or prepared monitoring configuration as an installed alert.

Use `references/tool-contract.md` for the included runnable helpers. If a required model connection is missing, finish the current stage's local artifacts and identify the exact connection still needed. Do not fabricate an execution result.
