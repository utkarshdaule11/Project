import os
import re
import subprocess

print("=== 1. CHECKPOINTS AND BIOMES IN CONTENT/STATES.TS ===")
with open('content/states.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate states array
states_idx = text.find('export const states: StateChapter[] = [')
states_block = text[states_idx:]

stops = []
# Find each { id: "...", order: N, name: "..." ... }
items = re.findall(r'id:\s*"([a-z-]+)",\s*\n\s*order:\s*(\d+),\s*\n\s*name:\s*"([^"]+)"', states_block)
print(f"Matched {len(items)} chapters in states array.")

for cid, order, name in items:
    # search within block of this checkpoint
    pos = states_block.find(f'id: "{cid}"')
    next_pos = states_block.find('id: "', pos + 20)
    chunk = states_block[pos:next_pos] if next_pos != -1 else states_block[pos:pos+3000]
    
    biome_id = re.search(r'biome:\s*\{\s*id:\s*"([^"]+)"', chunk)
    biome_name = re.search(r'name:\s*"([^"]+)"', chunk[chunk.find('biome:'):]) if 'biome:' in chunk else None
    
    bid = biome_id.group(1) if biome_id else "UNKNOWN"
    bname = biome_name.group(1) if biome_name else "UNKNOWN"
    stops.append({'order': int(order), 'id': cid, 'name': name, 'biome_id': bid, 'biome_name': bname})

for s in stops:
    print(f"Stop {s['order']:02d}: ID={s['id']:12} Name={s['name']:15} BiomeID={s['biome_id']:18} BiomeName={s['biome_name']}")

print("\n=== 2. ZONE GROUPING IN STATES.TS ===")
zones = {}
for s in stops:
    bid = s['biome_id']
    if bid not in zones:
        zones[bid] = {'name': s['biome_name'], 'stops': []}
    zones[bid]['stops'].append(s['name'])

for bid, z in zones.items():
    print(f"Zone '{bid}' ({z['name']}): {', '.join(z['stops'])}")

print("\n=== 3. HEROSECTION.TSX PHYSIOGRAPHIC ZONES ===")
with open('src/components/hero/HeroSection.tsx', 'r', encoding='utf-8') as f:
    hero_code = f.read()

pz_match = re.search(r'const physiographicZones = \[(.*?)\];', hero_code, re.DOTALL)
if pz_match:
    print(pz_match.group(0))

print("\n=== 4. GIT STATUS AUDIT ===")
git_status = subprocess.run(['git', 'status', '--short'], capture_output=True, text=True).stdout
tracked_modified = []
untracked = []
for line in git_status.strip().split('\n'):
    if line.startswith('??'):
        untracked.append(line[3:])
    else:
        tracked_modified.append(line)

print(f"Tracked modified ({len(tracked_modified)}):")
for tm in tracked_modified:
    print("  ", tm)

untracked_full = subprocess.run(['git', 'status', '-uall', '--porcelain'], capture_output=True, text=True).stdout
all_untracked = [l[3:] for l in untracked_full.strip().split('\n') if l.startswith('??')]
print(f"\nAll individual untracked files count: {len(all_untracked)}")

untracked_dirs = {}
for u in all_untracked:
    top_dir = u.split('/')[0] if '/' in u else u
    untracked_dirs[top_dir] = untracked_dirs.get(top_dir, 0) + 1

print("\nUntracked breakdown by top directory:")
for d, count in sorted(untracked_dirs.items()):
    print(f"  {d}: {count} files")

print("\nDetails of untracked files:")
for u in all_untracked:
    print("  ", u)
