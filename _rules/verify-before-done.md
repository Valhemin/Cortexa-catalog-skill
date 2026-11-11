---
name: Verify before done
category: Quality
default: on
description: Run the project checks before saying done
---
Before reporting a task as done, run the repo's own test, lint and build commands and report PASS or FAIL with the exact command. Never claim success without having run them.
For output no test can decide (answers, reports, copy, plans), grade it with the `output-eval` skill: quality/INSTRUCTION_FOLLOWING + quality/CORRECTNESS by default, reporting PASS or FAIL per rubric.
