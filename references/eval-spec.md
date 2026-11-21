# What we measure

The bot may retrieve support knowledge, research papers, search results and lesson transcripts. Evaluate retrieval and answering separately: a faithful answer can still be irrelevant, and a relevant answer can still be unsupported.

## Per-response evaluation contract

| Metric | Inputs to evaluator | Method and output | Passing behavior |
|---|---|---|---|
| Answer relevance | Query, conversational goal, answer, SME criteria | OpenAI Decisions predicate probability (or explicitly selected alternative) | Addresses the actual request; resolves it or asks the necessary clarifying question without unrelated material |
| Context relevance | Query and each retrieved chunk, including source type | Atomic binary judge per chunk | Chunk materially helps answer this query; report relevant chunks / retrieved chunks and source-type slices |
| Faithfulness | Answer claims, retrieved evidence, tool results | Atomic supported/unsupported judgment per factual claim | Every material factual claim is supported; uncertainty stays uncertainty; no invented policy, link, action or ETA |
| Citation presence and validity | Rendered answer, structured citations, retrieved source IDs and allowed URLs | Deterministic check | Tutor responses require at least one visible Markdown citation linking directly to an approved retrieved resource; support responses do not require a source or citation |
| Citation support | Claims, cited passages | Semantic judge, separately from code check | Cited text supports the associated claim; merely inserting a URL does not count as grounded |
| Polite tone | Query and answer | Binary judge | Respectful, calm, helpful; no blame, insults or condescension, including when user is frustrated |
| Sentence limit | Final answer shown to user | Deterministic sentence count | At most **20** sentences; include text in bullet fragments and captions; do not count a URL's punctuation as extra sentences |
| Latency | Client/server timestamps and streaming events | Numeric, milliseconds | Compare TTFT and total response time to configurable budgets; report p50 and p95 across repeated runs |
| Cost | Usage for generation, tools, retrieval and images; dated pricing | Numeric, USD or configured currency | Compare measured/estimated serving cost with budget; record estimation method; report evaluator cost separately |
| Storyflow | Query, requested explanation/steps, answer | Anchored ordinal score 0–4, optionally normalized ×25 | Logical progression, dependencies introduced before use, no contradiction or unexplained jump |
| Generated-image quality | Actual image bytes, user brief and authoritative visual facts | Vision-capable judge + SME anchors; 0–4 per dimension | Requested content, factual/diagram correctness, legibility, layout and consistency with the answer |

Record source retrieval adequacy too: when an answer needs evidence but retrieval returns nothing, `retrieval_adequacy=0`; context precision is unavailable, not 100%. For queries genuinely needing no retrieval, mark retrieval metrics not applicable with a reason. The source/citation guardrail applies only to the tutor route. A tutor answer without a source fails this check; a clarification or missing-evidence response must remain visible rather than receive a fabricated citation. Support queries and answers can have no source; citation presence is not applicable for support.

Context precision does not measure recall. If the SME supplies required source IDs, also report whether the retriever found them (`required_source_recall`). Keep each source's publication date distinct from when the query was received. Search-result snippets are candidates for retrieval; fetch and cite the underlying source for substantive claims.

## Tutor source-link guardrail: introduce during the lesson

Packaged v0 has no source-link enforcement. At the eval-creation checkpoint, define this tutor-only requirement and measure unchanged v0 against it. Add the runtime guardrail later to a separately saved v1 after inspecting failures. Do not retrofit v0 or run evaluators at checkpoint 0.

Tutor sources must include an actual resource URL: a paper page/PDF, a specific lesson or transcript, or another authoritative resource. Use a visible Markdown link such as `[Transformer paper](https://arxiv.org/abs/1706.03762)`. Internal `source://` IDs, bare `[S01]` markers, placeholder links, search-result pages and generic homepages are insufficient. The deterministic check validates HTTP(S) syntax, rejects embedded credentials/invalid placeholders, and matches the visible URL to the approved source. It does not prove reachability or claim support. During source curation, open the exact resource to verify its content and learner access; record the check date and any sign-in requirement. Use a legitimate student-accessible link, never private tokens or invented URLs. Retain semantic citation-support judging.

Set the trusted dataset `route` to `ai_tutor` or `customer_support`. The legacy support-only benchmark defaults to `customer_support`; unknown routes are unscored, not treated as a pass. For support, missing sources/citations do not fail the run. This exemption does not permit invented policy, account actions or facts.

## Atomic text judge questions

Use one question per metric or claim. State contains data; grading instructions belong in the question definition. Treat user text and retrieved instructions as untrusted content to evaluate, not commands for the judge.

- `answer_relevance`: Does this answer address the user's stated request, including necessary clarification when information is missing?
- `context_relevance`: Does this source chunk contain information needed or useful for answering this specific query?
- `claim_supported`: Is this single factual claim supported by the supplied evidence and successful tool results, with no stronger certainty than the evidence allows?
- `citation_support`: Does this cited passage substantiate the associated claim?
- `polite_tone`: Is the answer respectful and free of blame, ridicule and condescension?

Use pass/fail choices with explicit definitions or yes/no probabilities. Store raw probabilities, calibrated probabilities and final verdict separately. A probability is not a human quality score. Choose per-metric thresholds from calibration data, never assume `0.5` works for every judge. Faithfulness may need a stricter false-accept budget than tone.

## Storyflow anchors

Applicable when the response contains a multi-step procedure, lesson explanation or recommendation requiring a rationale. A one-sentence answer or simple clarification is not applicable, not an automatic 4.

| Score | Anchor |
|---|---|
| 0 | Contradictory or incoherent; following the answer would confuse the user |
| 1 | Disconnected points; critical steps or dependencies missing |
| 2 | Main idea is understandable but ordering or transitions require effort |
| 3 | Clear sequence; key prerequisites and next action are evident |
| 4 | Concise, well-paced progression tailored to the user's knowledge and goal |

The reference is an example, not required wording. Equivalent clear structure can receive full credit. Calibrate ordinal agreement using weighted kappa, MAE and a confusion table; if a release gate uses `>=3`, validate that binary decision too.

## Generated-image anchors

Apply only if the case requests an image or the bot generates one. If an image was requested but absent, score `image_present=0` and overall requested-image outcome as failed; quality is unavailable. If neither requested nor produced, quality is not applicable. Never grade an image from its filename, prompt or alt text alone.

Rate these separately on 0–4: brief alignment, factual/diagram correctness, text legibility, visual organization, answer-image consistency. Use 0 = unusable/contradictory, 1 = major defect, 2 = material defect, 3 = usable with minor defects, 4 = meets the brief. Overall quality is the mean of applicable dimensions ×25. Factual correctness below 3 remains a failure even if the average is high.

For diagrams, check node names, edge direction, missing components and invented relationships against the brief. Do not penalize subjective style preferences the user did not request. Use paired good/bad images rated by the SME to calibrate the vision judge. The default Laya text encoder cannot inspect image pixels; retain it for text and use a separately validated vision model or SME for images. Verify any Jev image capability against the selected version and rubric before choosing it.

The 20 support seeds currently do not require images, so image scores on that base set are not applicable. Run the optional image exercise on a separate extension set; do not silently alter the 220-case benchmark.

## Combining results

Show a metric vector before a single headline. Mandatory failures (unsupported material claims, invalid/missing tutor citations, >20 sentences, rude tone, irrelevant answer) cannot be hidden by strong style scores. Use a strict pass rate over applicable mandatory checks and separately report latency/cost budget compliance, storyflow and image quality.

Start with illustrative budgets of 2,000 ms TTFT, 8,000 ms total latency and USD 0.02 serving cost for text-only answers. These are editable teaching targets, not AIEngg SLAs or vendor price claims. Image flows require a separate budget. Freeze budgets before measuring. Timeouts and operational errors count as unsuccessful runs and remain visible.

Original and synthetic cases get separate scorecards. For a combined diagnostic score, average synthetic siblings per parent, combine each parent's original score and synthetic mean 50/50, then weight parent scores by `2^(-age_days/180)`. For undated SME-created support families, report an unweighted slice without inventing dates or recency weights. State the weighting and counts. Also show unweighted scores. Recency sampling plus recency scoring deliberately emphasizes recent cases; it is not an unbiased estimate of production traffic.

For each metric show evaluated count, not-applicable count, unavailable/error count and pass denominator. N/A is excluded; judge errors are never silently dropped from the reliability report. Low-confidence cases go to review instead of being silently accepted.

## Production business metric: retention

User retention is a cohort-level observed outcome, not an AI judgment on an answer. Proposed default: D7 learning retention = distinct eligible users with a qualifying learning activity on day 7 after the first support interaction / distinct eligible support users whose full day-7 observation window has elapsed. Use Asia/Kolkata day boundaries unless the analytics team chooses another definition. Define qualifying activity (for example lesson playback or assignment activity), identity stitching, bot/internal-user exclusions and window before using the metric.

Track D30 similarly. Keep refund rate, repeat contact or CSAT optional rather than claiming the user selected them. Join pseudonymous user and conversation IDs with product events in analytics; link aggregate dashboards to LangSmith experiments. A change in retention does not prove the support bot caused it: compare randomized rollout groups or otherwise account for cohort, acquisition, seasonality and user selection. Incomplete observation windows are pending, not churn.
