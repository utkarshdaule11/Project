import re

with open('content/states.ts', 'r', encoding='utf-8') as f:
    text = f.read()

states_idx = text.find('export const states: StateChapter[] = [')
states_block = text[states_idx:]

stops = re.findall(r'id:\s*"([a-z-]+)",\s*\n\s*order:\s*(\d+),\s*\n\s*name:\s*"[^"]+",\s*\n\s*stop:\s*"([^"]+)"', states_block)
print(f"Total matched checkpoints: {len(stops)}\n")

for i, (cid, order, stop_name) in enumerate(stops):
    pos = states_block.find(f'id: "{cid}",')
    if i + 1 < len(stops):
        next_cid = stops[i+1][0]
        next_pos = states_block.find(f'id: "{next_cid}",')
        chunk = states_block[pos:next_pos]
    else:
        chunk = states_block[pos:pos+4000]
    
    b_match = re.search(r'biome:\s*\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"', chunk)
    bid = b_match.group(1) if b_match else "MISSING"
    bname = b_match.group(2) if b_match else "MISSING"
    print(f"Stop {order.zfill(2)}: {stop_name:15} (ID: {cid:12}) -> Biome ID: {bid:18} | Name: {bname}")
