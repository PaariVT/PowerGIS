import fs from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = `${dir}/${entry.name}`;
  return entry.isDirectory() ? walk(path) : [path];
});
const sourceFiles = walk(fileURLToPath(new URL('../src/', import.meta.url))).filter((path) => /\\.(tsx?|jsx?)$/.test(path));
const sourceText = sourceFiles.map((path) => fs.readFileSync(path, 'utf8')).join('\n');

const checks = [
  ['Demo persona login is development/backend gated',
    /if\s*\(!isSimulatorRuntimeAllowed\(\)\s*\|\|\s*isSupabaseConfigured\)/.test(read('src/context/AuthContext.tsx'))],
  ['Role switching is development/backend gated',
    /if\s*\(!isSimulatorRuntimeAllowed\(\)\s*\|\|\s*isSupabaseConfigured\)\s*return/.test(read('src/context/AuthContext.tsx'))],
  ['Login page does not hardcode demo access',
    !/const\s+allowDemo\s*=\s*true/.test(read('src/components/auth/LoginPage.tsx'))],
  ['Demo entry points are development-only',
    (read('src/components/auth/LoginPage.tsx').match(/isSimulatorRuntimeAllowed\(\)\s*&&\s*!isSupabaseConfigured/g) || []).length >= 2],
  ['Simulator state restore is gated',
    /storedSim\s*===\s*'true'\s*&&\s*isSimulatorRuntimeAllowed\(\)\s*&&\s*!isSupabaseConfigured/.test(read('src/services/authService.ts'))],
  ['Unknown role defaults to read-only auditor',
    /ROLES_REGISTRY\[role\]\s*\|\|\s*ROLES_REGISTRY\.auditor/.test(read('src/config/rbacConfig.ts'))],
  ['Global asset search does not steal focus for command palette',
    !/onFocus=\{\(\)\s*=>\s*onOpenCommandPalette/.test(read('src/components/layout/Header.tsx'))],
  ['No direct HTML injection sink in application source',
    !/(dangerouslySetInnerHTML|\.innerHTML\s*=)/.test(sourceText)],
];

let failures = 0;
console.log('PowerGIS UI & security regression audit');
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
  if (!passed) failures++;
}
console.log(`Checks: ${checks.length}; failures: ${failures}`);
if (failures) process.exit(1);
