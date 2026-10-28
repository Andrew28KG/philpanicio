// Generates labelled placeholder photos so the site works before real photos exist.
// Run with: npm run placeholders
// Existing files are never overwritten, so it's safe to re-run after adding real photos.
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'src', 'assets');

const palette = {
  cream: '#F6E6CC',
  oat: '#EBD9BD',
  toast: '#C98B4E',
  crust: '#8A5A35',
  cocoa: '#3B2A22',
  honey: '#E3A23B',
  berry: '#D9464E',
  pandan: '#8DB06A',
};

const cake = (top, layer, filling) => `
  <g transform="translate(600 820)">
    <ellipse cx="0" cy="250" rx="380" ry="46" fill="${palette.cocoa}" opacity=".18"/>
    <rect x="-300" y="-40" width="600" height="280" rx="40" fill="${layer}"/>
    <rect x="-300" y="40" width="600" height="34" fill="${filling}"/>
    <rect x="-300" y="140" width="600" height="34" fill="${filling}"/>
    <ellipse cx="0" cy="-40" rx="300" ry="60" fill="${top}"/>
    <circle cx="-90" cy="-70" r="34" fill="${palette.berry}"/>
    <circle cx="10" cy="-82" r="34" fill="${palette.honey}"/>
    <circle cx="110" cy="-66" r="34" fill="${palette.berry}"/>
  </g>`;

const loaf = (color) => `
  <g transform="translate(600 860)">
    <ellipse cx="0" cy="170" rx="420" ry="50" fill="${palette.cocoa}" opacity=".18"/>
    <path d="M-380 150 C-400 -40 -220 -170 0 -170 C220 -170 400 -40 380 150 Z" fill="${color}"/>
    <path d="M-200 -60 q60 40 120 0 M-40 -90 q60 40 120 0 M120 -60 q60 40 120 0"
      stroke="${palette.oat}" stroke-width="18" fill="none" stroke-linecap="round"/>
  </g>`;

const rolls = () => `
  <g transform="translate(600 860)">
    <ellipse cx="0" cy="170" rx="420" ry="50" fill="${palette.cocoa}" opacity=".18"/>
    ${[-220, 0, 220].map((x) => `
      <circle cx="${x}" cy="40" r="120" fill="${palette.toast}"/>
      <path d="M${x} 40 m-70 0 a70 70 0 1 1 70 70 a45 45 0 1 1 -45 -45" stroke="${palette.crust}" stroke-width="14" fill="none"/>
      <path d="M${x - 80} -30 q40 30 80 0 q40 30 80 0" stroke="${palette.cream}" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}
  </g>`;

const label = (w, h, title, file) => `
  <text x="${w / 2}" y="${h * 0.16}" text-anchor="middle" font-family="Georgia, serif" font-size="${w * 0.06}" fill="${palette.cocoa}">${title}</text>
  <text x="${w / 2}" y="${h - h * 0.07}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${w * 0.028}" fill="${palette.crust}" letter-spacing="2">PLACEHOLDER · replace ${file}</text>`;

function scene(w, h, bgA, bgB, art, title, file) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><radialGradient id="g" cx="50%" cy="45%" r="75%">
      <stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <g transform="scale(${w / 1200} ${h / 1500})">${art}</g>
    ${label(w, h, title, file)}
  </svg>`);
}

// Product, hero and gallery photos are real now (see src/assets/products/menu). Only the story photo below still uses a placeholder.
const shots = [];

function ensureDir(file) {
  mkdirSync(dirname(file), { recursive: true });
}

for (const [rel, title, art, a, b, w = 1200, h = 1500] of shots) {
  const out = join(assets, rel);
  if (existsSync(out)) continue;
  ensureDir(out);
  const name = rel.split('/').pop();
  await sharp(scene(w, h, a, b, art, title, name)).jpeg({ quality: 82 }).toFile(out);
  console.log('created', rel);
}

// Story photo: crop the baker illustration out of the logo until a real photo is added.
const logo = join(assets, 'brand', 'logo.jpg');
const story = join(assets, 'story', 'placeholder-baker-phillip.jpg');
if (!existsSync(story)) {
  await sharp(logo).extract({ left: 200, top: 110, width: 680, height: 812 }).jpeg({ quality: 88 }).toFile(story);
  console.log('created story/placeholder-baker-phillip.jpg');
}

// Share image (1200×630) for WhatsApp / social previews.
const og = join(assets, 'og', 'og-cover.jpg');
if (!existsSync(og)) {
  // Crop off the phone line printed on the logo so only the site's number is shown.
  const badge = await sharp(logo).extract({ left: 70, top: 0, width: 940, height: 930 }).resize({ height: 560 }).toBuffer();
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="${palette.cream}"/>
    <circle cx="1080" cy="80" r="160" fill="${palette.honey}" opacity=".25"/>
    <text x="640" y="250" font-family="Georgia, serif" font-size="78" fill="${palette.cocoa}">Philpanicio</text>
    <text x="642" y="320" font-family="Georgia, serif" font-style="italic" font-size="38" fill="${palette.crust}">Roti &amp; kue rumahan</text>
    <text x="642" y="370" font-family="Georgia, serif" font-style="italic" font-size="38" fill="${palette.crust}">Homemade breads &amp; cakes</text>
    <rect x="642" y="430" width="420" height="76" rx="38" fill="${palette.cocoa}"/>
    <text x="852" y="479" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="${palette.cream}">Order via WhatsApp</text>
  </svg>`);
  await sharp(text).composite([{ input: badge, left: 40, top: 35 }]).jpeg({ quality: 85 }).toFile(og);
  console.log('created og/og-cover.jpg');
}
