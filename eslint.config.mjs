import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/**
 * Flat config. Next.js 16 removed `next lint` and `@next/eslint-plugin-next`
 * now ships flat config natively, so the old `FlatCompat` bridge over
 * `.eslintrc`-style extends no longer loads — run `npx eslint .` (or
 * `npm run lint`) directly.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores(['.next/**', '.netlify/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
