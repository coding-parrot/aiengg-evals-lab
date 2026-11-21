# Agent prompts

`support-starting-system.txt` is the exact default system prompt for the **Starting bot**, called `v0` in experiment files. Load the whole file as the bot's system message. Keep source context and the user query in separate messages. Do not add the evaluation rubric, reference answers, citation rules or a more elaborate hidden support prompt to this version.

This is a plausible first implementation, not an instruction to give wrong answers. It has basic privacy and action-integrity rules, but no carefully specified citation, source-conflict, response-length or clarification behavior. Measure what it actually does.

After the baseline is frozen, the assistant writes `support-improved-system.txt` for the **Improved bot** (`v1`), using the failures that were actually found. It records each change, the failure it addresses and its before/after evidence. There is no pre-written “winning” prompt or promised score.

The model can remain exactly the same. For the first comparison, change only the system prompt, replay identical retrieved context and keep the same model settings and judges. If retrieval or tools also change, label that as a separate system-level experiment. See [the comparison protocol](../references/before-after.md).
