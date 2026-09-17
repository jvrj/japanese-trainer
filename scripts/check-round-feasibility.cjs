#!/usr/bin/env node
/**
 * Round-feasibility checker — delve 13, build item B7.
 *
 * Answers one question per tile, per round size: can this tile legally assemble
 * a full round under the D9 composition caps, and if not, which step of D9.5's
 * relaxation ladder does it need?
 *
 * Exists because the size arithmetic was done in prose twice and was wrong twice.
 * Run it instead of arguing about it.
 *
 *   node scripts/check-round-feasibility.cjs            # both sizes
 *   node scripts/check-round-feasibility.cjs 30         # one size
 *   node scripts/check-round-feasibility.cjs --json
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// Kinds that count as "topic" (the tier rename group -> topic is build item B2;
// until it lands, the live data still says `group`).
const TOPIC_KINDS = new Set(['group', 'topic']);

// D9 caps. maxTopic is the topic-FAMILY count; share cap is half the round.
const CAPS = { 10: { maxTopic: 1 }, 30: { maxTopic: 3 } };

function loadFamilies(src) {
  const i = src.indexOf('WORD_FAMILIES');
  if (i < 0) throw new Error('WORD_FAMILIES not found in index.html');
  const s = src.indexOf('{', i);
  let depth = 0, end = -1;
  for (let j = s; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) { end = j; break; } }
  }
  const body = src.slice(s, end + 1)
    .split('\n')
    .filter(l => !/^\s*\/\*|^\s*\*|^\s*\/\//.test(l))
    .join('\n');
  return eval('(' + body + ')');
}

function countWordsByFamily(src) {
  const counts = {};
  const re = /\bfam\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) counts[m[1]] = (counts[m[1]] || 0) + 1;
  return counts;
}

/**
 * Walk D9.5's relaxation ladder for one tile at one size and report how far down
 * the ladder it has to go. The ladder is CUMULATIVE: reaching (b) means (a) was
 * taken too. A tile with no non-topic family always takes (a) first.
 *   0 = no relaxation needed
 *   a = the topic-opener rule yields
 *   b = ... and the topic count / share cap yields
 *   c = ... and the >=3 slice minimum yields
 *   X = cannot be served at all (tile has fewer live words than the round)
 */
function relaxationStep(fams, size) {
  const shareCap = Math.floor(size / 2);
  const { maxTopic } = CAPS[size];
  const topic = fams.filter(f => TOPIC_KINDS.has(f.k)).sort((a, b) => b.n - a.n);
  const nonTopic = fams.filter(f => !TOPIC_KINDS.has(f.k));
  const live = fams.reduce((a, f) => a + f.n, 0);

  if (live < size) return { step: 'X', why: `tile holds ${live} live words (< ${size})` };

  const seats = (list, cap) => list.reduce((a, f) => a + Math.min(f.n, cap), 0);
  const nonSeats = seats(nonTopic, shareCap);
  const hasOpener = nonTopic.length > 0;

  // step 0: opener rule holds AND caps satisfied
  if (hasOpener && nonSeats + seats(topic.slice(0, maxTopic), shareCap) >= size) {
    return { step: '0' };
  }
  // step a: topic-opener rule yields (a topic family may open)
  if (!hasOpener && seats(topic.slice(0, maxTopic), shareCap) >= size) {
    return { step: 'a', why: 'no non-topic family to open the round' };
  }
  // step b: topic count / share cap yields (all topic families available)
  if (nonSeats + seats(topic, shareCap) >= size) {
    return {
      step: 'b',
      why: hasOpener
        ? `only ${nonSeats + seats(topic.slice(0, maxTopic), shareCap)} seats under the ${maxTopic}-topic cap`
        : `no non-topic family, and the ${maxTopic}-topic cap is short`,
    };
  }
  // step c: slice minimum yields (families below 3 words may be admitted)
  if (live >= size) return { step: 'c', why: 'seats reachable only by admitting slices below 3' };
  return { step: 'X', why: 'unreachable' };
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const sizes = args.filter(a => /^\d+$/.test(a)).map(Number);
  const rounds = sizes.length ? sizes : [10, 30];

  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const FAM = loadFamilies(src);
  const counts = countWordsByFamily(src);

  const byTile = {};
  for (const [id, f] of Object.entries(FAM)) {
    const n = counts[id] || 0;
    if (!n) continue;
    (byTile[f.t] = byTile[f.t] || []).push({ id, k: f.k, n });
  }

  const report = {};
  for (const size of rounds) {
    if (!CAPS[size]) { console.error(`no caps defined for round size ${size}`); process.exit(2); }
    const relaxed = [];
    for (const [tile, fams] of Object.entries(byTile)) {
      const r = relaxationStep(fams, size);
      if (r.step !== '0') relaxed.push({ tile, ...r });
    }
    relaxed.sort((a, b) => a.tile.localeCompare(b.tile));
    report[size] = relaxed;
  }

  if (json) { console.log(JSON.stringify(report, null, 2)); return; }

  const union = new Set();
  for (const size of rounds) {
    const relaxed = report[size];
    console.log(`\n=== roundSize ${size} — tiles needing relaxation: ${relaxed.length} ===`);
    if (!relaxed.length) console.log('  (none — every tile assembles under the caps)');
    for (const r of relaxed) {
      union.add(r.tile);
      const thru = r.step === '0' ? '' : `relaxed through (${r.step})`;
      console.log(`  ${r.tile.padEnd(12)} ${thru.padEnd(22)} ${r.why || ''}`);
    }
  }
  if (rounds.length > 1) {
    console.log(`\nUnion across ${rounds.join(' and ')}: ${union.size} tiles — ${[...union].sort().join(', ')}`);
    console.log('Note: the sets are NOT nested — a tile can need relaxation at one size and not the other.');
  }
  const unserved = rounds.flatMap(s => report[s].filter(r => r.step === 'X'));
  process.exit(unserved.length ? 1 : 0);
}

main();
