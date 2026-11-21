# Runnable helper tools

The coding assistant runs these; students do not need to write or type code. Requires Node.js 20+ with `fetch` and `Intl.Segmenter`. Helpers use built-in modules, so no npm package install is needed for these files.

| Helper | Input | Actual output |
|---|---|---|
| `tools/checks.mjs` | Response JSON | Citation validity, sentence count and available cost/latency checks |
| `tools/jev.mjs` | Response JSON + secure Jev environment | Real typed judgments saved to JSON |
| `tools/calibrate.mjs` | SME labels joined to judge probabilities as CSV | Before/after confusion metrics and per-metric thresholds |
| `tools/benchmark.mjs` | Dataset JSON + built bot endpoint + Jev | Incremental raw runs, long-form CSV and execution manifest |

Natural-language trigger:

> Read `references/tool-contract.md`. Build the support agent endpoint to this contract, then run the three-case smoke test using the supplied draft data. Use real models. Show the retrieved context, answer, deterministic checks and Jev result for one case. Label the data unvalidated. Do not run the full benchmark until I trigger that checkpoint.

## Bot endpoint contract

POST JSON: `query`, `brand`, `scenario.context_mode` and optional `scenario.documents` for classroom evidence fixtures. `snapshot` uses the assistant-built retriever over `samples/sanitized-source-cards.json`; `empty` supplies no retrieved evidence; `conflicting_fixture` uses the deliberately contradictory classroom documents. The assistant implements a semantic or lexical retriever without reading the golden answer file. Fixture overrides are available only in classroom/staging mode, not public production input.

Return JSON:

```json
{
  "answer": "The response with a visible source marker. [S01]",
  "citations": [{"source_id": "S01", "url": "source://S01"}],
  "retrieved_context": [{"id": "S01", "text": "Retrieved evidence", "url": "source://S01", "citation_allowed": true}],
  "tool_results": [],
  "claims": [{"id": "claim-1", "text": "A single factual claim actually present in the answer", "source_ids": ["S01"]}],
  "storyflow_applicable": false,
  "image_artifact": null,
  "ttft_ms": null,
  "cost_usd": null
}
```

Extract all material claims with a separate checked extraction step; ensure quoted claims map to actual answer text. A single convenient claim does not establish whole-answer faithfulness. The supplied helper scores listed claims, records missing extraction and leaves coverage checking to the harness. The assistant must add that coverage check before producing a complete faithfulness score. Null cost/TTFT stays unavailable; instrument it before presenting a measured cost or streaming result.

Required secure environment: `BOT_ENDPOINT`, optional `BOT_API_KEY`, `TYPESAFE_API_KEY`, `JEV_MODEL` (selected version), `JUDGE_CONFIG` (path to calibrated thresholds). No secrets go in committed files or chat. `--draft` explicitly allows a teaching run on unapproved data and raw probabilities; it does not make the results validated. `--smoke` runs only three rows.

`node tools/checks.mjs response.json`

`node tools/jev.mjs response.json artifacts/judge-output.json`

`node tools/calibrate.mjs artifacts/labeled-probabilities.csv artifacts/judge-config.json`

`node tools/benchmark.mjs samples/benchmark.draft.json artifacts/smoke --draft --smoke`

The calibration CSV needs `family_id,split,metric,human_label,p_pass,human_reviewer`; split is `calibration` or `validation`. It performs threshold alignment on binary metrics, not model fine-tuning, probability recalibration or ordinal/image analysis. The skill guides the remaining analysis. The full benchmark helper is one pass; use separate versioned runs for repetitions and aggregate at the parent-family level.

The helpers currently implement Jev. For Laya, the coding assistant builds an adapter against the selected upstream encoder interface and runs the same contract tests. Vision evaluation and LangSmith publishing are connected by the assistant as part of their respective skills. Those paths are specified but not pre-executed in this pack.

Run `node --test tools/checks.test.mjs` to verify local invariants without paid model calls. No helper substitutes simulated model results when credentials are missing.
