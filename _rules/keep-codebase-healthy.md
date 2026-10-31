---
name: Keep the codebase healthy
category: Quality
default: on
description: Reuse before adding, small changes, tests with every change, no dead code
---
In an existing project: read the nearby code and match its style and structure; reuse existing helpers instead of adding a second version; keep each change small and focused; add or update a test for every behaviour you change; remove code you made unused; do not leave debug output or commented-out code. If you must touch a file that changes very often or has no tests, say so and add a test first. When done, run the project's own test, lint and build commands, fix what fails (at most 5 attempts, then stop and report what is still failing and why), and report PASS or FAIL with the exact command. Never say it is ready for production while any check fails or was not run.
