# Instructor guide · 100–120 minutes

## The story

Students already know how to build agents and RAG systems. Today's question is: **how do we know a change made the system better?** Follow the attached Evals notes: manual expectations → automated judges aligned to humans → synthetic coverage → repeatable benchmark → monitored deployment → regression feedback loop.

| Time | Instructor action | What students should notice |
|---|---|---|
| 0–10 min | Open the packaged v0 bot using the instructor invitation. Try three easy questions. Ask the class to vote whether it is ready. | Fluency and three successful examples are weak evidence. |
| 10–25 min | Trigger golden-set creation; open the intake form and source-linked CSV. SME edits two references live. | The test set encodes user goals and business-specific expectations, not generic chatbot quality. |
| 25–45 min | Run seed queries; rate good, bad and borderline answers; trigger judge calibration. Open disagreements. | Judges need evaluation too. Faithful-but-irrelevant, polite-but-wrong and long-but-impressive are different failures. |
| 45–60 min | Trigger 200 synthetic variants. Filter by parent and transformation; inspect a changed-evidence case. | More rows improve coverage only when transformations are meaningful. Changed scenarios may change correct behavior. |
| 60–75 min | Trigger the frozen 220-case baseline. Show quality vectors, cost, latency and failed traces. | A score becomes useful when it identifies a controllable failure. |
| 75–90 min | Fix one failure cluster and rerun v1. Show wins and regressions together. | Improvement is measured on the same benchmark; the evaluator is not changed to favor the new bot. |
| 90–110 min | Deploy to the existing staging/production target as authorized. Show LangSmith trace, online feedback and a staging alert drill. | Offline evals and production monitoring protect different failure paths. |
| 110–120 min | Add a reviewed production failure to regression data. Discuss retention and remaining uncertainty. | Monitoring creates new tests; retention is observed over users and time. |

## Concrete reveal sequence using the sourced draft

1. **Invoice mismatch:** old purchase, unexpected currency/date. A confident bot says the user was charged again. The reference asks for verified payment history and avoids inferring a new charge from an invoice display defect.
2. **Course redirect:** a system-design learner lands in LLD. A historic Slack promise said 24 hours; the eventual fix was reported later. A bot must not recycle that incident ETA as today's SLA.
3. **Playback on Wi-Fi versus hotspot:** the diagnostic path depends on OS and network. Generic Windows steps are irrelevant for a Mac user; faithful quotation of an old fix can still be the wrong answer.
4. **Citations:** insert a plausible-looking citation to an unrelated retrieved source. The code check may accept the known ID; the semantic support judge must reject the claim-source relationship.
5. **Length and style:** compare a polite 21-sentence answer with a useful 5-sentence answer. Tone and verbosity are separate checks; storyflow cannot erase the length failure.

Do not script a fabricated score improvement. If v0 does well, introduce a labeled controlled regression: remove a relevant retrieval source, substitute a stale version, drop rendered citations, or suppress a tool error. Run it as `v0-regression-demo`, not as an unnoticed change to the baseline. This shows why evals detect a real change even when the initial bot is strong.

## What the SME actually does

The included answers are drafts. The SME edits them, verifies sources and approves the behavior. Then the SME labels actual candidate answers against each metric. These are two different files and two different responsibilities. The assistant does collection, deduplication, generation, execution, scoring and reporting; learners focus on the judgment calls.

Before class, approve the 20 seeds and inspect changed-scenario variants. Pre-run the expensive model calls using the exact versions you will show. Keep their real trace links and timestamps for replay if a service is slow. Label replayed real runs with their original execution date. Do not present stored runs as newly executed live calls.

## Optional 10-minute storyflow/image exercise

Use a separate extension query: “Explain how retrieval, generation and evaluation fit together, and create a labeled diagram.” Supply an instructor-approved source card. Score the explanation using the 0–4 storyflow anchors. Compare a correct diagram with one containing a reversed edge and tiny labels. Have the SME and a vision judge score actual images. These cases demonstrate applicability and stay outside the frozen 220 support cases.

## Questions for the class

- Could this answer be faithful and still irrelevant? Could a relevant source still be insufficient?
- Did the judge agree because it understood the rule, or because it shares the generator's bias?
- What happened to false acceptance after calibration? What did we trade away?
- Do 200 variants of 20 situations give us 220 independent examples?
- Which change fixes the failure: source freshness, retrieval, tool routing, prompt or renderer?
- If retention drops while answer scores improve, what else should we investigate?

Homework: add a multi-turn failure; test a long-context truncation case; propose a QA workflow for the agent; decide where human review belongs. For multi-agent systems, evaluate component outputs and the end-to-end user outcome—several individually passing agents can still fail together.
