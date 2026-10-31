# Catalog check: index.json matches the tree, every linked skill exists, no symlinks. Run: python3 -I scripts/check.py
import json, os, re, sys
def fm(p):
    m = re.match(r'^---\n(.*?)\n---\n', open(p, encoding='utf-8').read(), re.S)
    return dict(re.findall(r'^([\w-]+):\s*(.*)$', m.group(1), re.M)) if m else {}
err = []
for d, dirs, files in os.walk('.'):
    if '.git' in d: continue
    for n in dirs + files:
        if os.path.islink(os.path.join(d, n)): err.append('symlink: ' + os.path.join(d, n))
idx = json.load(open('index.json'))
import subprocess; before = open('index.json', 'rb').read(); subprocess.run([sys.executable, '-I', 'scripts/index.py'], check=True, capture_output=True)
if open('index.json', 'rb').read() != before: err.append('index.json is stale: run python3 -I scripts/index.py and commit it')
if idx.get('format') != 1: err.append('index.json format must be 1')
shared = set(os.listdir('_shared/skills'))
roles = {r for r in os.listdir('.') if os.path.isfile(os.path.join(r, 'ROLE.md'))}
if roles != {r['id'] for r in idx['roles']}: err.append(f'index.json roles differ from folders: {sorted(roles ^ {r["id"] for r in idx["roles"]})}')
for r in sorted(roles):
    m = fm(os.path.join(r, 'ROLE.md'))
    if not m.get('name'): err.append(f'{r}: ROLE.md has no name')
    for s in [x.strip() for x in m.get('shared-skills', '').split(',') if x.strip()]:
        if s not in shared: err.append(f'{r}: shared skill {s} not in _shared/skills')
for s in shared:
    if not os.path.isfile(os.path.join('_shared/skills', s, 'SKILL.md')): err.append(f'_shared/skills/{s}: no SKILL.md')
for f in os.listdir('_rules'):
    if fm(os.path.join('_rules', f)).get('default', 'off') not in ('on', 'off'): err.append(f'_rules/{f}: default must be on|off')
print('\n'.join(err) or f'catalog ok: {len(roles)} roles, {len(shared)} shared skills, {len(os.listdir("_rules"))} rules')
sys.exit(1 if err else 0)
