// Kompres foto di public/assets supaya undangan ringan dibuka pakai kuota.
// File kamera mentah (4000x6000, belasan MB) tidak pernah ditampilkan sebesar
// itu: kartu galeri paling besar ±310 CSS px, lightbox ±430 CSS px. Di layar
// HP 3x DPR, sisi terpanjang 1600 px sudah lebih dari cukup.
//
// Pakai:
//   node scripts/optimize-images.mjs [folder-keluaran]
//
// Default keluaran: assets-optimized/ di root project (struktur folder sama).
// Sengaja DI LUAR public/, karena seluruh isi public/ ikut tersalin ke hasil
// build (lihat angular.json) — folder hasil di dalamnya akan jadi muatan ganda.
// Sengaja TIDAK menimpa file asli — periksa hasilnya dulu, baru tukar.

import { mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('sharp');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'public', 'assets');
const outDir = process.argv[2]
  ? join(process.cwd(), process.argv[2])
  : join(root, 'assets-optimized');

/**
 * Aturan per path (relatif terhadap public/assets). Dicocokkan berurutan,
 * yang pertama cocok dipakai. `max` = sisi terpanjang hasil, dalam piksel.
 */
const RULES = [
  { test: /^images\/gallery\//,        max: 1600, quality: 82 },  // kartu + lightbox
  { test: /^images\/(groom|bride)\./,  max: 1200, quality: 82 },  // oval 176 CSS px
  { test: /^panel-prewedding\.jpg$/,   max: 2400, quality: 80 },  // panel desktop
  { test: /^splash\/splash-photo/,     max: 1200, quality: 82 },
  { test: /^splash\/couple.*\.png$/,   max: 900,  quality: 80 },  // transparan: tetap PNG
  { test: /^images\/og-cover\.jpg$/,   skip: true },              // sudah kecil, hasil generate-icons
  { test: /^panel-prewedding_\.jpg$/,  drop: true },              // tidak dipakai di kode mana pun
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const fmt = (b) => `${(b / 1048576).toFixed(2)} MB`;
let totalBefore = 0, totalAfter = 0;

for (const file of walk(srcDir).sort()) {
  const rel = relative(srcDir, file);
  const ext = extname(file).toLowerCase();
  const rule = RULES.find((r) => r.test.test(rel));
  const before = statSync(file).size;
  const dest = join(outDir, rel);
  mkdirSync(dirname(dest), { recursive: true });

  // Yang bukan foto (SVG, mp3, README) & yang di-skip: salin apa adanya,
  // supaya folder keluaran bisa langsung menggantikan public/assets.
  if (rule?.drop) continue;
  if (!rule || rule.skip || !['.jpg', '.jpeg', '.png'].includes(ext)) {
    copyFileSync(file, dest);
    totalBefore += before;
    totalAfter += before;
    continue;
  }

  // .rotate() tanpa argumen menerapkan orientasi EXIF sebelum metadata
  // dibuang — tanpa ini foto portrait bisa berubah jadi landscape.
  let img = sharp(file).rotate().resize({
    width: rule.max,
    height: rule.max,
    fit: 'inside',
    withoutEnlargement: true,
  });
  img = ext === '.png'
    ? img.png({ palette: true, quality: rule.quality, effort: 8 })
    : img.jpeg({ quality: rule.quality, mozjpeg: true, progressive: true });

  await img.toFile(dest);
  const after = statSync(dest).size;
  totalBefore += before;
  totalAfter += after;
  console.log(`${rel.padEnd(32)} ${fmt(before).padStart(9)} → ${fmt(after).padStart(9)}`);
}

console.log(`\nTotal ${fmt(totalBefore)} → ${fmt(totalAfter)} (${Math.round((1 - totalAfter / totalBefore) * 100)}% lebih kecil)`);
console.log(`Hasil: ${outDir}`);
