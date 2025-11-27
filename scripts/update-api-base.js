// Script to update API_BASE in frontend files for production
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const files = [
  'public/driver/scripts/app.js',
  'public/admin/scripts/app.js'
];

files.forEach(file => {
  try {
    if (!existsSync(file)) {
      console.warn(`⚠ File not found: ${file}, skipping...`);
      return;
    }
    
    let content = readFileSync(file, 'utf8');
    
    // Update API_BASE to use /api for production
    // Handle both single line and multi-line formats
    content = content.replace(
      /const API_BASE = \(location\.hostname === 'localhost' \|\| location\.hostname === '127\.0\.0\.1'\) \? 'http:\/\/localhost:4000' : '';/g,
      `const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '/api';`
    );
    
    // Also handle multi-line format if exists
    content = content.replace(
      /const API_BASE = \(location\.hostname === 'localhost' \|\| location\.hostname === '127\.0\.0\.1'\)[\s\S]*?'';/g,
      `const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '/api';`
    );
    
    writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated ${file}`);
  } catch (err) {
    console.error(`❌ Error updating ${file}:`, err.message);
  }
});

console.log('✅ API_BASE updated for production!');

