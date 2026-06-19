/* Task 5: Image Optimization Script */
// Usage: node scripts/optimize-images.mjs
// Requires: npm install sharp

import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = resolve(__dirname, '..', 'src', 'assets', 'images');
const OUTPUT_DIR = resolve(__dirname, '..', 'public', 'images');

const FORMATS = ['webp', 'avif'];
const SIZES = [480, 768, 1024, 1920];

async function optimizeImages() {
  if (!existsSync(INPUT_DIR)) {
    console.log('[images] No input directory found, skipping');
    return;
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const files = readdirSync(INPUT_DIR).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

  for (const file of files) {
    const inputPath = join(INPUT_DIR, file);
    const name = file.replace(extname(file), '');

    for (const format of FORMATS) {
      for (const size of SIZES) {
        const outputPath = join(OUTPUT_DIR, `${name}-${size}.${format}`);
        await sharp(inputPath)
          .resize(size)
          [format]({ quality: 80 })
          .toFile(outputPath);
        console.log(`[images] Created ${outputPath}`);
      }
    }

    // Generate blur placeholder
    const blurPath = join(OUTPUT_DIR, `${name}-blur.webp`);
    await sharp(inputPath)
      .resize(32)
      .webp({ quality: 20 })
      .toFile(blurPath);
    console.log(`[images] Created ${blurPath}`);
  }

  console.log('[images] Done');
}

optimizeImages().catch(console.error);
