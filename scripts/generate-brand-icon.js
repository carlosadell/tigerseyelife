#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ONYX = '#0B0B0C';
const GOLD = '#C89F4D';

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');

function eyeMarkSvg({ size, padding, stroke = 5, background = ONYX }) {
  const inner = size - padding * 2;
  const scale = inner / 64;
  const tx = padding;
  const ty = padding;
  const sw = stroke;
  const swThin = stroke * 0.72;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${background}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})" stroke="${GOLD}" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <polygon points="32,6 58,32 32,58 6,32" stroke-width="${sw / scale}"/>
    <path d="M15 32c5.3-8 10.9-12 17-12s11.7 4 17 12c-5.3 8-10.9 12-17 12S20.3 40 15 32Z" stroke-width="${sw / scale}"/>
    <circle cx="32" cy="32" r="8" stroke-width="${sw / scale}"/>
    <line x1="32" x2="32" y1="14" y2="50" stroke-width="${swThin / scale}"/>
  </g>
</svg>`;
}

async function render(svg, outPath) {
  const buf = Buffer.from(svg);
  await sharp(buf).png().toFile(outPath);
  const bytes = fs.statSync(outPath).size;
  console.log(`  ${path.relative(projectRoot, outPath)}  (${(bytes / 1024).toFixed(1)} KB)`);
}

async function main() {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Assets dir not found: ${assetsDir}`);
  }

  const size = 1024;

  console.log('Generating branded icons from EyeMark geometry…');

  await render(
    eyeMarkSvg({ size, padding: 160, stroke: 18 }),
    path.join(assetsDir, 'icon.png'),
  );

  await render(
    eyeMarkSvg({ size, padding: 280, stroke: 22 }),
    path.join(assetsDir, 'adaptive-icon.png'),
  );

  await render(
    eyeMarkSvg({ size, padding: 220, stroke: 18 }),
    path.join(assetsDir, 'splash-icon.png'),
  );

  await render(
    eyeMarkSvg({ size: 64, padding: 6, stroke: 1.5 }),
    path.join(assetsDir, 'favicon.png'),
  );

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
