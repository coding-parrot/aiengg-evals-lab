# Pack validation

Checked on 22 November 2026.

- All five SKILL.md files pass the skill format validator.
- Six local tests pass: valid/missing/forged citations, 20/21 sentence boundary, bullet counting, unknown cost/latency handling, CSV quoting, calibration holdout independence and missing-label/family-leakage rejection.
- Dataset checks pass: 20 seed rows, 200 synthetic rows, 220 unique IDs, valid parent links, preserved source dates and no family crossing calibration/validation. There are 18 underlying incident families because two seeds share an incident with another seed.
- Browser test passes for intake defaults, custom-query entry, JSON download and mobile layout width. The intake and SME review workbook were visually inspected.
- Sources are sanitized and references remain explicitly unreviewed. The shared pack excludes the private source register.

Not executed: paid bot/model calls, live Jev scoring, Laya inference, vision scoring, LangSmith publishing, alert delivery or cloud deployment. The helper APIs follow reviewed official documentation, but live integration must be smoke-tested with the selected versions and credentials. See the tool contract for implemented versus assistant-built integration paths.

The learner runs the lab through their coding assistant. The assistant builds the initial bot and remaining integrations, while these skills define the stages and the files to inspect.

## Real discussion data and pending database import

- Added 40 original discussion queries (20 support, 20 tutor), 38 fictional profiles and selected redacted staff excerpts for the original 20 seeds.
- Reviewed the selected query text and excerpts for identifying details; removed author names, mentions, contact information and source locators. Public profiles use invented names and `example.invalid` addresses. Private provenance stays outside the repository.
- Enumerated 2,949 Slack feed events in the two-year window: 2,946 discussion notifications, including 779 AI replies, and 3 non-discussion events. A webhook rate-limit notice means Slack coverage is not database completeness. Current hidden status remains unknown.
- Ten local tests pass: the original six plus import visibility/lineage preservation, PII-pattern removal, incomplete-export rejection and distinct unknown authors.
- Database schema discovery, read-only source export, source-count reconciliation, and full semantic PII/routing review remain pending the user's connection file. The preparation helper writes private review candidates, not automatically publishable data.
