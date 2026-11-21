# Pack validation

Checked on 22 November 2026.

- All five SKILL.md files pass the skill format validator.
- Six local tests pass: valid/missing/forged citations, 20/21 sentence boundary, bullet counting, unknown cost/latency handling, CSV quoting, calibration holdout independence and missing-label/family-leakage rejection.
- Dataset checks pass: 20 seed rows, 200 synthetic rows, 220 unique IDs, valid parent links, preserved source dates and no family crossing calibration/validation. There are 18 underlying incident families because two seeds share an incident with another seed.
- Browser test passes for intake defaults, custom-query entry, JSON download and mobile layout width. The intake and SME review workbook were visually inspected.
- Sources are sanitized and references remain explicitly unreviewed. The shared pack excludes the private source register.

Not executed: paid bot/model calls, live Jev scoring, Laya inference, vision scoring, LangSmith publishing, alert delivery or cloud deployment. The helper APIs follow reviewed official documentation, but live integration must be smoke-tested with the selected versions and credentials. See the tool contract for implemented versus assistant-built integration paths.

The learner runs the lab through their coding assistant. The assistant builds the initial bot and remaining integrations, while these skills define the stages and the files to inspect.
