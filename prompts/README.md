# Packaged tutor v0

Load tutor-starting-system.txt as the starting prompt. It is a basic tutor with no source/citation guardrail, sentence-limit enforcement or automatic evals. Do not silently strengthen it at checkpoint 0.

This tutor-only baseline replaces the previous domain. Never compare its scores against the old support baseline. Its prompt/source hashes are frozen in config/v0-manifest.json.

After SME eval creation and baseline measurement, write tutor-improved-system.txt from observed failures. Add the direct-citation guardrail in v1 during the lesson. For a prompt-only comparison, keep evidence/model/judges fixed; runtime/retrieval changes require a separate whole-agent comparison.
