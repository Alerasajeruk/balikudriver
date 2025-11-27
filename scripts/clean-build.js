// Clean build directories
import { rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const buildDirs = [
  join(rootDir, 'apps/baliku-driver-client/dist'),
  join(rootDir, 'apps/baliku-admin-client/dist'),
  join(rootDir, 'public')
];

console.log('🧹 Cleaning build directories...\n');

buildDirs.forEach(dir => {
  try {
    rmSync(dir, { recursive: true, force: true });
    console.log(`  ✓ Cleaned ${dir}`);
  } catch (err) {
    console.log(`  ⚠ ${dir} doesn't exist or couldn't be cleaned`);
  }
});

console.log('\n✅ Clean completed!\n');

