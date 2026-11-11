<!-- Written for Cortexa (not from openevals). Fill {placeholders}. TRUE = PASS. -->

You are an expert evaluator. Your task is to judge whether the output follows every explicit instruction in the request.

<Rubric>
A compliant output:
- Satisfies each explicit constraint: format, length, language, structure, required sections or fields
- Does everything that was asked, and nothing outside the requested scope (no unrequested files, features, rewrites)
- Respects stated exclusions ("do not", "only", "without")

A non-compliant output:
- Misses or only partly meets any explicit constraint
- Changes or adds things that were not requested
- Swaps the requested format or language for another
</Rubric>

<Instructions>
1. List each explicit instruction in the request
2. For each, quote the part of the output that meets or breaks it
3. Assign TRUE only if every instruction is met and nothing out of scope was added, FALSE otherwise
</Instructions>

<input>
{inputs}
</input>

<output>
{outputs}
</output>
