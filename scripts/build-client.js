// Build script for PWA clients (driver & admin)
// Minifies JS, CSS, and optimizes for production

import { build } from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const clientType = process.argv[2]; // 'driver' or 'admin'

if (!clientType || !['driver', 'admin'].includes(clientType)) {
  console.error('Usage: node scripts/build-client.js [driver|admin]');
  process.exit(1);
}

const sourceDir = join(rootDir, `apps/baliku-${clientType}-client`);
const buildDir = join(rootDir, `apps/baliku-${clientType}-client/dist`);

console.log(`\n🔨 Building ${clientType} client...\n`);

// Clean build directory
try {
  const { rmSync } = await import('fs');
  rmSync(buildDir, { recursive: true, force: true });
} catch (err) {
  // Ignore if directory doesn't exist
}

mkdirSync(buildDir, { recursive: true });

// Copy static files
const staticFiles = [
  'index.html',
  'manifest.webmanifest',
  'sw.js'
];

const staticDirs = ['icons', 'images'];

console.log('📋 Copying static files...');

// Copy static files
staticFiles.forEach(file => {
  const src = join(sourceDir, file);
  const dest = join(buildDir, file);
  try {
    copyFileSync(src, dest);
    console.log(`  ✓ ${file}`);
  } catch (err) {
    console.warn(`  ⚠ ${file} not found, skipping...`);
  }
});

// Copy static directories
const copyRecursive = (src, dest) => {
  try {
    const entries = readdirSync(src);
    mkdirSync(dest, { recursive: true });
    
    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      const stat = statSync(srcPath);
      
      if (stat.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  } catch (err) {
    console.warn(`  ⚠ Directory ${src} not found, skipping...`);
  }
};

staticDirs.forEach(dir => {
  const src = join(sourceDir, dir);
  const dest = join(buildDir, dir);
  copyRecursive(src, dest);
  console.log(`  ✓ ${dir}/`);
});

// Build JavaScript
console.log('\n📦 Building JavaScript...');
try {
  await build({
    entryPoints: [join(sourceDir, 'scripts/app.js')],
    bundle: false, // Don't bundle, just minify
    minify: true,
    format: 'esm',
    target: 'es2020',
    outfile: join(buildDir, 'scripts/app.js'),
    legalComments: 'none',
    drop: ['console', 'debugger'], // Remove console.log and debugger
    sourcemap: false,
    treeShaking: true,
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });
  console.log('  ✓ JavaScript minified');
} catch (err) {
  console.error('  ✗ JavaScript build failed:', err);
  process.exit(1);
}

// Minify CSS (simple minification - remove comments and whitespace)
console.log('\n🎨 Minifying CSS...');
try {
  const cssPath = join(sourceDir, 'styles/main.css');
  let cssContent = readFileSync(cssPath, 'utf8');
  
  // Simple CSS minification
  // Remove comments
  cssContent = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove extra whitespace
  cssContent = cssContent.replace(/\s+/g, ' ');
  // Remove whitespace around certain characters
  cssContent = cssContent.replace(/\s*([{}:;,])\s*/g, '$1');
  // Remove leading/trailing whitespace
  cssContent = cssContent.trim();
  
  mkdirSync(join(buildDir, 'styles'), { recursive: true });
  writeFileSync(join(buildDir, 'styles/main.css'), cssContent);
  console.log('  ✓ CSS minified');
} catch (err) {
  console.error('  ✗ CSS minification failed:', err);
  // Copy original CSS if minification fails
  try {
    mkdirSync(join(buildDir, 'styles'), { recursive: true });
    copyFileSync(join(sourceDir, 'styles/main.css'), join(buildDir, 'styles/main.css'));
    console.log('  ⚠ Using original CSS (minification failed)');
  } catch (copyErr) {
    console.error('  ✗ Failed to copy CSS:', copyErr);
  }
}

// Minify Service Worker
console.log('\n⚙️  Optimizing Service Worker...');
try {
  const swPath = join(sourceDir, 'sw.js');
  const swContent = readFileSync(swPath, 'utf8');
  
  await build({
    entryPoints: [swPath],
    bundle: false,
    minify: true,
    format: 'esm',
    target: 'es2020',
    outfile: join(buildDir, 'sw.js'),
    legalComments: 'none',
    drop: ['console', 'debugger'],
    sourcemap: false
  });
  console.log('  ✓ Service Worker optimized');
} catch (err) {
  console.error('  ✗ Service Worker optimization failed:', err);
  // Copy original if optimization fails
  try {
    copyFileSync(swPath, join(buildDir, 'sw.js'));
    console.log('  ⚠ Using original Service Worker');
  } catch (copyErr) {
    console.error('  ✗ Failed to copy Service Worker:', copyErr);
  }
}

// Update index.html to use minified files
console.log('\n📝 Updating index.html...');
try {
  const indexPath = join(buildDir, 'index.html');
  let htmlContent = readFileSync(indexPath, 'utf8');
  
  // Update paths if needed (they should already be correct)
  // Add cache busting version if needed
  const version = Date.now();
  htmlContent = htmlContent.replace(
    /href="styles\/main\.css"/g,
    `href="styles/main.css?v=${version}"`
  );
  htmlContent = htmlContent.replace(
    /src="scripts\/app\.js"/g,
    `src="scripts/app.js?v=${version}"`
  );
  
  writeFileSync(indexPath, htmlContent);
  console.log('  ✓ index.html updated');
} catch (err) {
  console.warn('  ⚠ Could not update index.html:', err.message);
}

// Get file sizes
console.log('\n📊 Build Summary:');
try {
  const { statSync } = await import('fs');
  
  const getFileSize = (filePath) => {
    try {
      const stats = statSync(filePath);
      return (stats.size / 1024).toFixed(2) + ' KB';
    } catch {
      return 'N/A';
    }
  };
  
  const jsSize = getFileSize(join(buildDir, 'scripts/app.js'));
  const cssSize = getFileSize(join(buildDir, 'styles/main.css'));
  const swSize = getFileSize(join(buildDir, 'sw.js'));
  
  console.log(`  JavaScript: ${jsSize}`);
  console.log(`  CSS: ${cssSize}`);
  console.log(`  Service Worker: ${swSize}`);
} catch (err) {
  // Ignore
}

console.log(`\n✅ ${clientType} client build completed!\n`);
console.log(`📁 Build output: ${buildDir}\n`);

