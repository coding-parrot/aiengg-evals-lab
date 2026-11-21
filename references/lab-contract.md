# Tutor-only, query-first lab contract

## Fixed choices

Packaged AI tutor v0; one tutor route; no profile/persona workflow. The unit is query → evidence → expected answer → actual answer → evaluation.

20 seed questions plus 200 additional variants. Prioritize recent real questions using a configurable 180-day half-life. Query topics include AI engineering, system design and programming. Sources include checked papers, official documentation and lesson transcripts with direct resource links.

Use typed OpenAI Decisions by default with the shared instructor backend. Do not claim a verified encoder-only architecture. Evaluate relevance, context relevance, faithfulness, citations, tone, at most 20 sentences, latency/cost and applicable storyflow/image outputs. Retention is production-only.

## Checkpoints

At checkpoint 0 use prompts/tutor-starting-system.txt exactly. No automatic eval, citation guardrail or answer rewriting. Save answers and traces.

The SME defines evals and approves expected answers at checkpoint 1. Then calibrate judges, expand data and benchmark unchanged v0. Create separate v1 changes from observed failures, introducing direct-citation enforcement during that lesson stage. This is a new tutor baseline; old domain scores are not comparable.

## Data and leakage

Bot inputs contain only the query, permitted conversation and retrieved knowledge. Never send expected answers, source answer keys, route/reviewer labels, split/family IDs or judge scores to generation. Attach trusted evaluation metadata afterward.

Golden rows include case_id, family_id, route=ai_tutor, corpus_record_id when historical, query provenance, source_observed_at, timestamp_kind, query, intent, expected_response, required_behaviors, forbidden_behaviors, source_ids, source_urls, as_of, split, recency_weight and SME review fields. Do not add profiles or personas.

SME-created queries have an authored date but no fabricated historical timestamp. Each approved tutor seed still needs educational evidence. Synthetic rows add parent_id, generation_method, matrix_cell, transformation, semantic_change, expected_changed and review_status.

Group related questions before splitting. Synthetic siblings inherit the parent split and original timestamp; synthetic creation time is separate. The supplied grouping is conservative by topic, not a claim of known private conversation linkage.

## Evidence and measurement

Query history identifies useful questions. Checked educational sources substantiate answers. Do not treat AI or peer replies as truth. Source cards are short classroom paraphrases needing SME review; verify the linked resource and student access.

Record query, actual answer, retrieved sources, returned model, prompt/source hashes, latency, usage and applicable outputs. Store artifacts/lab-state.json with checkpoint and versions. Missing prices, TTFT and claim extraction remain unavailable, never zero or passes.

Show metric vectors, denominators, original/synthetic slices, family-balanced scores and held-out agreement. Keep model, evidence, dataset and judges fixed for paired tutor v0/v1 comparisons. Runtime or retrieval changes are separate whole-agent experiments. Report regressions and lack of improvement honestly.
