// Script to copy built frontend files to public/ directory for Vercel deployment
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const copyRecursive = (src, dest) => {
  if (!existsSync(src)) {
    console.warn(`⚠ Source directory not found: ${src}`);
    return;
  }
  
  const entries = readdirSync(src);
  
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
};

// Create public directories
mkdirSync('public/driver', { recursive: true });
mkdirSync('public/admin', { recursive: true });

// Copy driver client (from dist/ if exists, otherwise from source)
const driverSource = existsSync('apps/baliku-driver-client/dist') 
  ? 'apps/baliku-driver-client/dist'
  : 'apps/baliku-driver-client';

console.log('Copying driver client from:', driverSource);
copyRecursive(driverSource, 'public/driver');

// Copy admin client (from dist/ if exists, otherwise from source)
const adminSource = existsSync('apps/baliku-admin-client/dist')
  ? 'apps/baliku-admin-client/dist'
  : 'apps/baliku-admin-client';

console.log('Copying admin client from:', adminSource);
copyRecursive(adminSource, 'public/admin');

console.log('✅ Frontend files copied to public/ directory');

