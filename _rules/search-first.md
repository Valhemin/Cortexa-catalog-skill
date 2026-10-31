---
name: Search before reading
category: Efficiency
default: on
description: Use rg to find symbols before opening files; use ast-grep for structural patterns when available
---

## Rule

Never open a file to find something. Search first, read only what matches.

## Tool ladder

1. **rg** — text/regex search (always available in Cortexa agents via PATH)
2. **ast-grep / sg** — structural code search (optional; check `command -v sg` first)
3. **Read** — only after search narrows it to specific lines

## rg patterns

```bash
# Find symbol definition (fastest)
rg -n "function|const|class|def" -e "mySymbol" --type ts

# Find files containing a pattern, then read only those
rg -l "import.*Router" --type ts | head -20

# Language-scoped search (ts, js, py, go, rust, md…)
rg -t ts "useEffect\(" src/

# Exact word match
rg -w "build" --type ts

# Multiline / context
rg -A 3 -B 1 "export function build"

# Structured output (machine-readable)
rg --json "pattern" | jq '.data.path.text' 2>/dev/null

# Custom type for project-specific extensions
rg --type-add 'mts:*.mts' -t mts "export"
```

## ast-grep (sg) patterns — structural, not textual

```bash
# Check availability first
command -v sg || echo "not installed; use rg"

# Find all arrow functions assigned to a const
sg -p 'const $F = ($_) => $_' --lang ts

# Find calls to a specific function
sg -p 'build($$$)' --lang ts

# Find React hooks with dependency array
sg -p 'useEffect(() => { $$$ }, [$$$])' --lang tsx

# List files with matches (like rg -l)
sg -p 'export default $_' --lang ts --json | jq -r '.file' | sort -u
```

## Install ast-grep (once, optional)

```bash
# Via npm (no native build required)
npm install -g @ast-grep/cli
# Or via Homebrew
brew install ast-grep
```

## Decision table

| Goal | Command |
|------|---------|
| Find where X is defined | `rg -n "export.*\bX\b"` |
| Find all callers of X | `rg -n "\bX\(" --type ts` |
| Structural: all call sites of X regardless of whitespace | `sg -p 'X($$$)'` |
| Find file containing import | `rg -l "from '.*module'"` |
| Read one section of a large file | `rg -n -A 20 "function target"` then `Read offset+limit` |

## What NOT to do

- Do not `Read` a 500-line file to find a 3-line function. Search first.
- Do not repeat the same `rg` with different flags if the first had zero results — the symbol is not there; check spelling or try a broader pattern.
- Do not use `grep` — `rg` is faster, respects `.gitignore`, and supports `--type`.
- Do not use `find` for code symbols — `rg -l` does the same faster.
