/* Task 47: Font Subsetting Script */
// Usage: node scripts/subset-fonts.mjs
// Requires: npm install fonttools (Python) or glyphhanger

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FONTS = [
  {
    family: 'Be Vietnam Pro',
    weights: [300, 400, 500, 600, 700, 800, 900],
    url: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap',
  },
  {
    family: 'Playfair Display',
    weights: [500, 600, 700, 800],
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600;1,700&display=swap',
  },
];

async function subsetFonts() {
  const outputDir = resolve(__dirname, '..', 'public', 'fonts');
  mkdirSync(outputDir, { recursive: true });

  // Read the HTML to extract used characters
  const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf-8');
  const usedChars = [...new Set(html.match(/[\S\s]/g))].join('');

  // For production: use glyphhanger or fonttools to subset
  // This is a placeholder that downloads and subsets fonts
  console.log(`[subset] Output: ${outputDir}`);
  console.log(`[subset] Unique chars: ${usedChars.length}`);
  console.log('[subset] Run: npx glyphhanger --family="Be Vietnam Pro" --subset="*" --formats=woff2 --output=' + outputDir);
  console.log('[subset] Then update CSS @font-face src to point to local files');

  // Generate @font-face CSS
  let css = '';
  FONTS.forEach(font => {
    font.weights.forEach(w => {
      css += `@font-face {
  font-family: '${font.family}';
  font-style: normal;
  font-weight: ${w};
  src: url('/fonts/${font.family.replace(/\s+/g, '')}-${w}.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}\n`;
    });
  });

  writeFileSync(resolve(outputDir, 'fonts.css'), css, 'utf-8');
  console.log('[subset] fonts.css generated');
}

subsetFonts().catch(console.error);
