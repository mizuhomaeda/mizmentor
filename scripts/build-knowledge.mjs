/**
 * Bakes knowledge/*.md into api/_knowledge.generated.ts as plain string constants.
 *
 * Why this exists: Vercel serverless functions only bundle what is statically
 * imported. Reading knowledge/*.md from disk at runtime works locally and fails
 * in production. Generating a .ts module means the text is part of the bundle.
 *
 * Re-run this after editing anything in knowledge/:
 *   npm run build:knowledge
 *
 * The generated file is committed on purpose, so a Vercel build never has to run
 * this script.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCES = [
  { constName: 'ROLE_CARD', file: 'RoleCard_SyntheticPersona.md' },
  { constName: 'KNOWLEDGE_MENTORING_PATTERNS', file: 'Knowledge_MentoringPatterns.md' },
  { constName: 'KNOWLEDGE_LECTURE_MATERIAL', file: 'Knowledge_LectureMaterial.md' },
  { constName: 'KNOWLEDGE_VOICE_SAMPLES', file: 'Knowledge_VoiceSamples.md' },
];

const parts = [
  '/**',
  ' * GENERATED FILE - DO NOT EDIT BY HAND.',
  ' *',
  ' * Source: knowledge/*.md',
  ' * Regenerate with: npm run build:knowledge',
  ' */',
  '',
];

let totalChars = 0;

for (const { constName, file } of SOURCES) {
  const text = readFileSync(join(root, 'knowledge', file), 'utf8').trim();
  totalChars += text.length;
  // JSON.stringify produces a valid TS string literal with every character
  // escaped correctly, including backticks, ${ and newlines.
  parts.push(`/** From knowledge/${file} (${text.length} chars) */`);
  parts.push(`export const ${constName} = ${JSON.stringify(text)};`);
  parts.push('');
  console.log(`  ${file.padEnd(36)} -> ${constName} (${text.length} chars)`);
}

const outPath = join(root, 'api', '_knowledge.generated.ts');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, parts.join('\n'), 'utf8');

console.log(`\nWrote api/_knowledge.generated.ts (${totalChars} chars of knowledge total)`);
