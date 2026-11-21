---
name: monitor-production
description: Prepare and operate the tutor-agent evaluation loop in LangSmith with trace feedback, quality and operational alerts, SME review and separate retention monitoring.
---

# Deploy and monitor

Read `../../references/langsmith-runbook.md`, `../../references/eval-spec.md` and the latest release decision. Reuse the project's deployment target; if none is available, build and test the deployment artifact and ask for the target. Do not claim a production deployment from a local server or sample trace.

Instrument root and child spans with versioned retrieval, tool use, answer, citation, latency, usage and error data. Use pseudonymous user and conversation IDs and learner-accessible source references. Production knowledge must be approved and current; private discussion records cannot be exposed as public teaching evidence.

Configure the validated text judges and deterministic checks as online evaluators. Keep judge computation outside the response critical path unless explicitly designing an inline guardrail. Offline expected answers are normally unavailable in production: use evidence-grounded rubrics and tool results. Validate this reference-free online setup with SME labels; offline judge alignment does not automatically transfer.

Start with a documented random sample of ordinary traffic and all selected high-impact events. Record inclusion probabilities and sample counts; oversampled failures cannot estimate the overall production failure rate without adjustment. Track whether evaluations actually ran and how long they lag. An empty feedback dashboard is not 100% quality.

Prepare `monitoring-plan.json` and concrete alert rules from the runbook. If service access is present and this stage authorizes setup, configure them and verify by test traces. Use a staging project for the alert drill. Only send notifications to an explicitly selected destination; setting up this lab is not a request to message an arbitrary Slack channel.

For retention, join product activity events to pseudonymous users and rollout versions in analytics. Report D7/D30 only for mature cohorts. Link the resulting business dashboard to the LangSmith project; do not invent per-query retention scores or describe ordinary feedback averages as retention.

Close the loop: low score/user complaint → trace and source inspection → SME annotation → new family in regression data → candidate patch → offline comparison → staged rollout → monitoring. Use `../analyze-errors/SKILL.md` to code production failures, show ranked error-frequency charts and prioritize fixes with the existing taxonomy. Keep sampled failure counts distinct from population rates. Judge drift triggers recalibration, not automatic rewriting of the product. Fixes may be proposed automatically, but production promotion follows the project's actual release gates and authorization.

Outputs: deployment URL and version when actually deployed; monitoring config; trace links; test-alert evidence; retention event contract; incident runbook; remaining setup gaps. The class should see one failed trace reach review and one regression case added. Show the observed outcome, never a mocked production success.
