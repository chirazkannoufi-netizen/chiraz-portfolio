#!/usr/bin/env node
/**
 * Translation parity check.
 *
 * Fails the build if any locale is missing a key that `en` has, or carries a
 * key `en` doesn't. Four languages drift silently otherwise: a missing key
 * renders as the raw key path in production, which is exactly the kind of
 * defect nobody notices in the language they don't speak.
 *
 * Also flags type mismatches (string vs array vs object) — a common source of
 * runtime errors when one locale ships `roles` as a string by accident.
 *
 * Run: node scripts/check-i18n.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MESSAGES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'messages');
const REFERENCE = 'en';

/** Flatten to `a.b.c` → typeof value, so we can diff two shapes as flat sets. */
function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      out.set(path, `array[${value.length}]`);
    } else if (value !== null && typeof value === 'object') {
      flatten(value, path, out);
    } else {
      out.set(path, typeof value);
    }
  }
  return out;
}

const files = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'));
const shapes = new Map();

for (const file of files) {
  const locale = file.replace(/\.json$/, '');
  try {
    shapes.set(locale, flatten(JSON.parse(readFileSync(join(MESSAGES_DIR, file), 'utf8'))));
  } catch (error) {
    console.error(`✖ ${file} is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

const reference = shapes.get(REFERENCE);
if (!reference) {
  console.error(`✖ Reference locale "${REFERENCE}.json" not found.`);
  process.exit(1);
}

let failed = false;

for (const [locale, shape] of shapes) {
  if (locale === REFERENCE) continue;

  const missing = [...reference.keys()].filter((k) => !shape.has(k));
  const extra = [...shape.keys()].filter((k) => !reference.has(k));
  const mismatched = [...reference.entries()]
    .filter(([k, t]) => shape.has(k) && shape.get(k) !== t)
    .map(([k, t]) => `${k} (en: ${t}, ${locale}: ${shape.get(k)})`);

  if (missing.length || extra.length || mismatched.length) {
    failed = true;
    console.error(`\n✖ ${locale}.json`);
    missing.forEach((k) => console.error(`   missing:    ${k}`));
    extra.forEach((k) => console.error(`   unexpected: ${k}`));
    mismatched.forEach((m) => console.error(`   type:       ${m}`));
  } else {
    console.log(`✓ ${locale}.json — ${shape.size} keys, in sync with ${REFERENCE}`);
  }
}

console.log(`\n${reference.size} keys per locale × ${shapes.size} locales.`);

if (failed) {
  console.error('\nTranslation parity check FAILED.');
  process.exit(1);
}
console.log('Translation parity check passed.');
