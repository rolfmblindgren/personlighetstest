import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const file = resolve(process.cwd(), 'src/components/LikertRow.tsx');
const source = readFileSync(file, 'utf8');
const match = source.match(/const\s+NO_LABELS_7\s*=\s*\[(.*?)\];/s);
assert(match, 'Fant ikke NO_LABELS_7 i LikertRow.tsx');

const labels = Array.from(match[1].matchAll(/"([^"]+)"/g), (m) => m[1]);
const expected = [
  'heltuenig',
  'noksåuenig',
  'littuenig',
  'usikker',
  'littenig',
  'noksåenig',
  'heltenig',
];

assert.deepEqual(
  labels,
  expected,
  `Likert-rekkefølgen er feil. Forventet ${expected.join(' -> ')}, fikk ${labels.join(' -> ')}`,
);

console.log('Likert order OK');
