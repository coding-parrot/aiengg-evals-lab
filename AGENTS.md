# Cohort lab instructions

Default endpoint: https://aiengg-evals-lab.gkcs.chatgpt.site (also in `config/classroom.json`). Work entirely inside the repo/terminal. Run `node tools/lab.mjs doctor`; if the student key is missing, use `node tools/lab.mjs connect` with hidden terminal input, or `connect --key-file PATH` for a private file. Never require a browser, invitation, login, student OpenAI key, or a new bot implementation. Run `node tools/lab.mjs ask "QUESTION"` for checkpoint 0; show its saved actual trace. Do not print or commit the saved connection key. Node 22+ is the only helper runtime dependency; no npm install is required. The student supplies the shared lab key once.

Read `START-HERE.md` and follow the user's current stage. The v0 bot is already packaged in tools/cohort-server.mjs with cohort.html and config/v0-manifest.json. Default student access is the public lab URL plus one shared student API key; never require an individual invitation or a student OpenAI key. Start with that implementation; do not ask learners to build a baseline or replace it. Create v1 only after inspecting actual evaluation failures. This is an agent-driven lesson: implement and run the requested work, then show its files and observed output. Do not ask students to write code manually. Use the existing stack or TypeScript for a new project.

Use the skills by reading their `SKILL.md` files directly. Do not assume they are installed globally or that an IDE supports a particular slash command. Explicit file mentions are the portable entry point.

Golden-set creation and synthetic expansion are interactive. Follow each skill's question phase and wait for the user's answers before selecting/generating cases. Defaults and saved files are proposals, not user answers. Offer “use all proposed defaults” as an explicit reply; never infer acceptance from silence. Ask in chat or the IDE question tool, without requiring a browser. Synthetic expansion has its own intake even after golden-set intake. Do not ask profile/persona questions.

Keep the learner-facing checkpoint boundaries. Preserve data provenance and draft/SME status. Never present sample rows as exact learner quotes, assistant-drafted references as SME labels, raw judge probabilities as validated scores, or prepared monitoring configuration as an installed alert.

Use `references/tool-contract.md` for the included runnable helpers. If a required model connection is missing, finish the current stage's local artifacts and identify the exact connection still needed. Do not fabricate an execution result.

This lab is tutor-only and query-first. Do not request profiles, personas or demographics, route operational problems, or resurrect earlier domain datasets. Select questions, preserve timestamps, check educational source links, collect SME expected answers and run the requested eval stage. The current v0 is a new tutor baseline; old domain scores are not comparable.
