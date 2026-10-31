# Cortexa catalog

Roles (agents), skills and rules that Cortexa fetches on demand.

- `<role>/ROLE.md`: role prompt. Frontmatter `shared-skills:` links skills from `_shared/skills/`.
- `<role>/skills/<skill>/SKILL.md`: skills only this role uses.
- `_shared/skills/`: skills used by several roles (one copy).
- `_rules/*.md`: rules. `default: on|off`.
- `index.json`: generated list of roles, their skills and rules.

Third-party content is copied as text with its license; see `SOURCES.md` for repo, commit and license of every item.
