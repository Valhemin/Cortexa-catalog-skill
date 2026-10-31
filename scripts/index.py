# Regenerate index.json from the folders. Run after adding/removing a role, skill or rule: python3 -I scripts/index.py
import json, os, re
def fm(p):
    m = re.match(r'^---\n(.*?)\n---\n', open(p, encoding='utf-8').read(), re.S)
    return {k: v.strip().strip('"\'') for k, v in re.findall(r'^([\w-]+):\s*(.*)$', m.group(1), re.M)} if m else {}
roles = []
for r in sorted(d for d in os.listdir('.') if os.path.isfile(os.path.join(d, 'ROLE.md'))):
    m, sk = fm(os.path.join(r, 'ROLE.md')), os.path.join(r, 'skills')
    own = sorted(os.listdir(sk)) if os.path.isdir(sk) else []
    roles.append({'id': r, 'name': m.get('name', r), 'domain': m.get('domain', 'other'), 'source': m.get('source', ''), 'skills': own + [x.strip() for x in m.get('shared-skills', '').split(',') if x.strip()]})
rules = [{'id': f[:-3], **{k: fm(os.path.join('_rules', f)).get(k, d) for k, d in (('name', ''), ('category', ''), ('default', 'off'), ('source', ''))}} for f in sorted(os.listdir('_rules')) if f.endswith('.md')]
json.dump({'format': 1, 'roles': roles, 'rules': rules, 'shared': sorted(os.listdir('_shared/skills'))}, open('index.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(f'index.json: {len(roles)} roles, {len(rules)} rules')
