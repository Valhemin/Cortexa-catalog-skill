---
name: xerj-hub
description: Answer a question about public source code, a standard, a regulation or an advisory feed from a pre-indexed hub corpus with one command, xerj "your question" or xerj_hub_ask MCP tool. Use it for exact public material you cannot quote from memory.
---
<!-- xerj-init-version: 6 -->

# XERJ hub: ask, do not clone

Pick the source before you search:

- **HUB**: public material you cannot quote exactly. A library's source at a pinned commit, a
  standard, a regulation, an advisory feed.
- **LOCAL**: files only this machine has. This project, private documents, exports.
  `xerj autoindex <folder> --prefix <name>` once, then pass that `--prefix <name>` to
  `xerj search` and `xerj def`. Without `--prefix` they search the default `ax` prefix.
- **NEITHER**: a fact you can already state exactly. Retrieval on memorised content only adds cost.

## Ask the hub

```sh
xerj "<question>"
```

One line. No corpus name, no clone, no index. XERJ picks the corpus (your project's dependencies
first), fetches its signed, pre-indexed pack on first use, and answers. Retrieval is lexical, not
semantic: use the words and identifiers the source uses. The bare form needs a space in the
question; for a single word write `xerj ask "<word>"`.

## Exact questions

```sh
xerj ask --def <SYMBOL>
```

Use `--def` for a value, a signature or a default. It prints the definition (`file:line`, the
declaration, and a `value:` line for a constant or macro) and no passages. Add `--corpus <slug>` when
more than one corpus defines the name.

## MCP tools

`xerj mcp` serves three hub tools:
- `xerj_hub_ask` `{question, corpus?, mode?, max_tokens?}`: asks the hub corpus.
- `xerj_hub_def` `{slug, symbol, k?}`: `xerj ask --corpus <slug> --def <SYMBOL>`.
- `xerj_hub_find` `{question, k?}`: which corpora could answer, best first.
