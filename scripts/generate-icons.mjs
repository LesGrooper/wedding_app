// Generate brand mark "R & A" → favicon, icon PWA, apple-touch, OG cover,
// dan src/app/Component/monogram/monogram.paths.ts untuk komponen Angular.
//
// SENGAJA TIDAK ikut `pnpm run build`: aset icon nyaris tidak pernah berubah
// dan build tidak boleh butuh jaringan. Jalankan manual saat mark-nya diubah:
//   pnpm run icons
// Hasilnya di-commit.
//
// Kenapa huruf di-outline jadi <path>, bukan <text>?
//   1. Favicon SVG dirender di luar konteks dokumen — webfont dari <link>
//      Google Fonts TIDAK ikut dimuat, jadi <text> akan jatuh ke serif default.
//   2. Cormorant Garamond & Great Vibes tidak terinstall di mesin lokal,
//      jadi rasterizer server-side juga tidak akan menemukannya.
// Outline membuat aset bebas dari ketergantungan font, di browser maupun di sini.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { parseEnvFile } from './lib/env.mjs';

const TAG = 'generate-icons';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = join(root, 'scripts', 'fonts');
const publicDir = join(root, 'public');
const imagesDir = join(publicDir, 'assets', 'images');
const splashDir = join(publicDir, 'assets', 'splash');
const monogramDir = join(root, 'src', 'app', 'Component', 'monogram');

/* ================= Palet — samakan dengan tailwind.config.js ================= */

const C = {
  ivory: '#FFFDFB',
  rose: '#D8A7B1',
  roseDark: '#B8848F',
  gold: '#D4AF37',
  goldSoft: '#E8D4A0',
  ink: '#3B3138',
  muted: '#8B7B82',
};

// Sparkle 4-titik — path yang sama dipakai di splash/ambient-birds/ambient-dawn
// dan public/assets/splash/sparkles.svg. Radius ±12 unit, berpusat di (0,0).
const SPARKLE =
  'M0,-12 C1.5,-3 3,-1.5 12,0 C3,1.5 1.5,3 0,12 C-1.5,3 -3,1.5 -12,0 C-3,-1.5 -1.5,-3 0,-12 Z';

/* ============================ Sumber font (OFL-1.1) ========================== */

const FONTS = {
  serif: {
    file: 'CormorantGaramond[wght].ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf',
    // Variable font: instance default-nya wght=300 (Light) — terlalu tipis untuk
    // monogram ukuran kecil, jadi axis-nya digeser ke 600 (SemiBold) di bawah.
    variation: { wght: 600 },
  },
  script: {
    file: 'GreatVibes-Regular.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf',
  },
};

async function loadFont(key) {
  const spec = FONTS[key];
  const path = join(fontDir, spec.file);

  if (!existsSync(path)) {
    console.log(`[${TAG}] ${spec.file} belum ada — mengunduh dari google/fonts…`);
    try {
      const res = await fetch(spec.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      mkdirSync(fontDir, { recursive: true });
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      console.error(`[${TAG}] Gagal mengunduh ${spec.file}: ${err.message}`);
      console.error(`[${TAG}] Unduh manual dari ${spec.url}`);
      console.error(`[${TAG}] lalu simpan ke scripts/fonts/${spec.file} dan ulangi.`);
      process.exit(1);
    }
  }

  const buf = readFileSync(path);
  let font;
  try {
    font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  } catch (err) {
    console.error(`[${TAG}] ${spec.file} gagal di-parse: ${err.message}`);
    console.error(`[${TAG}] Hapus scripts/fonts/${spec.file} lalu jalankan ulang.`);
    process.exit(1);
  }
  if (spec.variation) font.variation.set(spec.variation);
  return font;
}

/* ============================ Outline teks → path ============================ */

// Angka default Cormorant adalah oldstyle (text figures) — '6' menjulang di atas
// x-height sehingga "2026" di baris tanggal berhuruf kapital terbaca seperti
// glyph rusak/kepotong. Font ini menyediakan varian lining figures ('.lf') yang
// sejajar cap-height; dipilih lewat nama glyph karena opentype.js tidak
// menerapkan fitur OpenType 'lnum' pada getPath().
const LINING_FIGURES = {
  0: 'zero.lf',
  1: 'one.lf',
  2: 'two.lf',
  3: 'three.lf',
  4: 'four.lf',
  5: 'five.lf',
  6: 'six.lf',
  7: 'seven.lf',
  8: 'eight.lf',
  9: 'nine.lf',
};

// Path di-serialisasi manual, TIDAK memakai Path.toPathData() dari opentype.js.
// Alasannya bug di opentype.js 2.0.0 — roundDecimal() membulatkan lewat string:
//     Math.round(decimalPart + "e+" + places) + "e-" + places
// Angka < 1e-6 di-stringify JS dalam notasi eksponensial ("5.68e-14"), sehingga
// ekspresinya jadi "5.68e-14e+3" → NaN. Koordinat dengan pecahan sekecil itu
// muncul wajar dari interpolasi variable font, dan satu NaN membuat renderer
// SVG berhenti di tengah path (huruf berikutnya hilang tanpa error).
const num = (v, decimals) => {
  let s = v.toFixed(decimals);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
};

function pathToD(path, decimals = 3) {
  const n = (v) => num(v, decimals);
  let d = '';
  for (const c of path.commands) {
    switch (c.type) {
      case 'M': d += `M${n(c.x)},${n(c.y)}`; break;
      case 'L': d += `L${n(c.x)},${n(c.y)}`; break;
      case 'C': d += `C${n(c.x1)},${n(c.y1)} ${n(c.x2)},${n(c.y2)} ${n(c.x)},${n(c.y)}`; break;
      case 'Q': d += `Q${n(c.x1)},${n(c.y1)} ${n(c.x)},${n(c.y)}`; break;
      case 'Z': d += 'Z'; break;
    }
  }
  return d;
}

/**
 * Ubah teks menjadi satu path gabungan pada baseline y=0, mulai x=0.
 * Advance dihitung manual supaya `tracking` (letter-spacing) bisa dipakai.
 * @param figures 'default' | 'lining'
 * @returns {{ d: string, bb: object, w: number, h: number }}
 */
function outline(font, text, size, tracking = 0, figures = 'default') {
  const scale = size / font.unitsPerEm;
  const combined = new opentype.Path();
  let x = 0;
  for (const ch of text) {
    const glyph = figures === 'lining' ? liningGlyph(font, ch) : font.charToGlyph(ch);
    combined.extend(glyph.getPath(x, 0, size, {}, font));
    x += glyph.advanceWidth * scale + tracking;
  }
  const bb = combined.getBoundingBox();
  return { d: pathToD(combined), bb, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 };
}

/** glyph lining figure kalau tersedia; jatuh ke glyph normal kalau tidak. */
function liningGlyph(font, ch) {
  const name = LINING_FIGURES[ch];
  if (name) {
    const idx = font.nameToGlyphIndex(name);
    if (idx) return font.glyphs.get(idx);
  }
  return font.charToGlyph(ch);
}

/** transform agar bbox glyph pas ter-center di (cx, cy). */
function centerAt(g, cx, cy) {
  const dx = cx - (g.bb.x1 + g.w / 2);
  const dy = cy - (g.bb.y1 + g.h / 2);
  return `translate(${r(dx)} ${r(dy)})`;
}

/** transform agar glyph ter-center horizontal di cx dengan baseline di by. */
function baselineAt(g, cx, by) {
  return `translate(${r(cx - (g.bb.x1 + g.w / 2))} ${r(by)})`;
}

const r = (n) => Math.round(n * 1000) / 1000;

/* ============================== Mark: COMPACT =============================== */
// Hanya ampersand di atas chip solid. Dua kapital + '&' jadi ~5px per huruf di
// 16px dan nyatu jadi bubur, jadi varian tab sengaja cuma '&': padat, asimetris,
// tetap terbaca.
//
// Ampersand-nya Cormorant SemiBold, BUKAN Great Vibes seperti di varian full.
// Diuji dengan merender kandidat pada 16px: hairline Great Vibes hilang dan
// bentuknya terbaca seperti 'G', sedangkan '&' Cormorant tetap jelas. Varian
// full tetap pakai Great Vibes karena hanya tampil di >=180px.
//
// Keyline emas juga dibuang di ukuran ini: stroke 1 unit pada viewBox 32 =
// 0.5px di 16px, yang cuma jadi kabur dan mendesak glyph. Emas tetap hadir di
// semua ukuran >=180px.
//
// Kontras dihitung manual: gold #D4AF37 di atas rose-dark #B8848F hanya 1.48:1
// (ditolak — akan hilang). Ivory di atas rose-dark = 3.07:1 (lolos ambang
// large-text 3:1); gold-soft di atas ink = 8.57:1 untuk dark mode.

const COMPACT = { vb: 32, ampSize: 30 };

function buildCompact({ px, scheme = 'light' } = {}) {
  const { vb } = COMPACT;
  const amp = outline(fonts.serif, '&', COMPACT.ampSize);

  const themed =
    scheme === 'css'
      ? `<style>
    .g{fill:${C.roseDark}}.a{fill:${C.ivory}}
    @media (prefers-color-scheme:dark){.g{fill:${C.ink}}.a{fill:${C.goldSoft}}}
  </style>`
      : '';
  const col =
    scheme === 'dark' ? { ground: C.ink, glyph: C.goldSoft } : { ground: C.roseDark, glyph: C.ivory };
  const cls = scheme === 'css' ? { g: ' class="g"', a: ' class="a"' } : { g: '', a: '' };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}"${sizeAttrs(px)}>
  <!-- Monogram R & A — varian compact (favicon). AUTO-GENERATED, lihat scripts/generate-icons.mjs -->
  ${themed}
  <rect${cls.g} x="0" y="0" width="${vb}" height="${vb}" rx="7" fill="${col.ground}"/>
  <path${cls.a} d="${amp.d}" transform="${centerAt(amp, vb / 2, vb / 2 + 0.4)}" fill="${col.glyph}"/>
</svg>
`;
}

/* =============================== Mark: FULL ================================= */
// R & A di dalam ring emas tipis (efek wax seal) + hairline emas di bawah
// (gema `w-24 h-px bg-gold` yang dipakai di bawah tiap judul section)
// + sparkle 4-titik di atas.

const FULL = {
  vb: 120,
  cx: 60,
  letterSize: 34,
  ampSize: 25,
  gap: 4,
  baseline: 69,
  ampBaselineShift: -1.5,
  ringOuter: 52,
  ringInner: 47.5,
  ruleY: 79.5,
  ruleHalf: 17,
  sparkleY: 37,
  sparkleScale: 0.6,
};

/** Hitung path + transform ketiga glyph monogram penuh (dipakai juga oleh komponen Angular). */
function fullGlyphs() {
  const f = FULL;
  const R = outline(fonts.serif, 'R', f.letterSize);
  const A = outline(fonts.serif, 'A', f.letterSize);
  const amp = outline(fonts.script, '&', f.ampSize);

  const total = R.w + f.gap + amp.w + f.gap + A.w;
  let x = f.cx - total / 2;

  const tR = `translate(${r(x - R.bb.x1)} ${f.baseline})`;
  x += R.w + f.gap;
  const tAmp = `translate(${r(x - amp.bb.x1)} ${r(f.baseline + f.ampBaselineShift)})`;
  x += amp.w + f.gap;
  const tA = `translate(${r(x - A.bb.x1)} ${f.baseline})`;

  return { R: { ...R, t: tR }, amp: { ...amp, t: tAmp }, A: { ...A, t: tA } };
}

/**
 * @param px            ukuran raster (opsional; kalau kosong SVG tanpa width/height)
 * @param ground        'ivory' | 'none'  — iOS tidak menghormati alpha, jadi
 *                      apple-touch & maskable wajib punya ground opaque
 * @param contentScale  <1 untuk maskable (safe zone), skala terhadap titik pusat
 * @param framed        tampilkan ring emas
 */
function buildFull({ px, ground = 'none', contentScale = 1, framed = true } = {}) {
  const f = FULL;
  const g = fullGlyphs();
  const s = contentScale;
  const wrap = s === 1 ? '' : ` transform="translate(${r(f.cx * (1 - s))} ${r(f.cx * (1 - s))}) scale(${s})"`;

  const ring = framed
    ? `
    <circle cx="${f.cx}" cy="${f.cx}" r="${f.ringOuter}" fill="none" stroke="${C.gold}" stroke-width="1.6" opacity="0.85"/>
    <circle cx="${f.cx}" cy="${f.cx}" r="${f.ringInner}" fill="none" stroke="${C.gold}" stroke-width="0.7" opacity="0.4"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f.vb} ${f.vb}"${sizeAttrs(px)}>
  <!-- Monogram R & A — varian full/seal. AUTO-GENERATED, lihat scripts/generate-icons.mjs -->
  ${ground === 'ivory' ? `<rect x="0" y="0" width="${f.vb}" height="${f.vb}" fill="${C.ivory}"/>` : ''}
  <g${wrap}>${ring}
    <path d="${SPARKLE}" transform="translate(${f.cx} ${f.sparkleY}) scale(${f.sparkleScale})" fill="${C.goldSoft}"/>
    <path d="${g.R.d}" transform="${g.R.t}" fill="${C.roseDark}"/>
    <path d="${g.amp.d}" transform="${g.amp.t}" fill="${C.gold}"/>
    <path d="${g.A.d}" transform="${g.A.t}" fill="${C.roseDark}"/>
    <rect x="${f.cx - f.ruleHalf}" y="${f.ruleY}" width="${f.ruleHalf * 2}" height="0.9" fill="${C.gold}" opacity="0.8"/>
  </g>
</svg>
`;
}

const sizeAttrs = (px) => (px ? ` width="${px}" height="${px}"` : '');

/* ============================== OG cover 1200×630 =========================== */
// Me-composite aset floral yang sudah ada (bloom-a / leaf-sprig / sparkles) —
// jangan gambar floral baru.

// Sengaja TANPA tanggal/lokasi: satu build melayani beberapa acara (?acara=),
// dan crawler preview WhatsApp tidak menjalankan JS — cover ini tampil sama
// untuk link Banjar maupun Cimahi. Tanggal tercetak = salah untuk salah satunya.
function buildOgCover({ groom, bride }) {
  const W = 1200;
  const H = 630;
  const cx = W / 2;

  const nGroom = outline(fonts.serif, groom, 54);
  const nBride = outline(fonts.serif, bride, 54);
  const amp = outline(fonts.script, '&', 46);
  const caption = outline(fonts.serif, 'UNDANGAN PERNIKAHAN', 25, 3.2, 'lining');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <!-- OG cover — AUTO-GENERATED, lihat scripts/generate-icons.mjs -->
  <defs>
    <radialGradient id="og-bg" cx="50%" cy="38%" r="78%">
      <stop offset="0%" stop-color="${C.ivory}"/>
      <stop offset="62%" stop-color="#FBF4EF"/>
      <stop offset="100%" stop-color="#F5E5DD"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#og-bg)"/>

  <g fill="none" stroke="${C.gold}" stroke-width="1" opacity="0.45">
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="4"/>
  </g>

  <g transform="translate(${cx - 75} 46) scale(1.25)">${stripSvgTag(buildFull({ framed: true }))}</g>

  <path d="${nGroom.d}" transform="${baselineAt(nGroom, cx, 322)}" fill="${C.ink}"/>
  <path d="${amp.d}" transform="${baselineAt(amp, cx, 386)}" fill="${C.gold}"/>
  <path d="${nBride.d}" transform="${baselineAt(nBride, cx, 452)}" fill="${C.ink}"/>

  <rect x="${cx - 60}" y="492" width="120" height="1" fill="${C.gold}" opacity="0.7"/>
  <path d="${caption.d}" transform="${baselineAt(caption, cx, 542)}" fill="${C.muted}"/>
</svg>
`;
}

/** buang wrapper <svg> supaya isinya bisa ditanam sebagai <g> di SVG lain. */
function stripSvgTag(svg) {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

/* ================================= Rasterisasi ============================== */

/**
 * Jaring pengaman: satu koordinat NaN membuat renderer SVG diam-diam berhenti
 * di tengah path, jadi lebih baik gagal keras daripada menghasilkan aset rusak.
 */
function assertClean(svg, label) {
  if (/NaN|undefined/.test(svg)) {
    console.error(`[${TAG}] SVG '${label}' mengandung NaN/undefined — path rusak, dibatalkan.`);
    process.exit(1);
  }
  return svg;
}

const png = (svg, label) =>
  sharp(Buffer.from(assertClean(svg, label))).png({ compressionLevel: 9 }).toBuffer();

/**
 * Rangkai file .ico — container sederhana: header 6 byte + directory entry
 * 16 byte per gambar + payload PNG mentah (PNG-in-ICO, didukung semua
 * browser modern). sharp sendiri tidak bisa menulis .ico.
 */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  entries.forEach((e, i) => {
    const o = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o); // 0 berarti 256
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o + 1);
    dir.writeUInt8(0, o + 2); // jumlah warna palet
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // color planes
    dir.writeUInt16LE(32, o + 6); // bit per pixel
    dir.writeUInt32LE(e.buffer.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.buffer.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.buffer)]);
}

/* ====================== Path untuk komponen Angular ========================= */

function writeMonogramPaths() {
  const g = fullGlyphs();
  const amp = outline(fonts.serif, '&', COMPACT.ampSize);
  const data = {
    viewBox: `0 0 ${FULL.vb} ${FULL.vb}`,
    compactViewBox: `0 0 ${COMPACT.vb} ${COMPACT.vb}`,
    center: FULL.cx,
    ringOuter: FULL.ringOuter,
    ringInner: FULL.ringInner,
    sparkle: SPARKLE,
    sparkleTransform: `translate(${FULL.cx} ${FULL.sparkleY}) scale(${FULL.sparkleScale})`,
    rule: { x: FULL.cx - FULL.ruleHalf, y: FULL.ruleY, w: FULL.ruleHalf * 2, h: 0.9 },
    letterR: { d: g.R.d, transform: g.R.t },
    ampersand: { d: g.amp.d, transform: g.amp.t },
    letterA: { d: g.A.d, transform: g.A.t },
    compact: {
      size: COMPACT.vb,
      rx: 7,
      ampersand: { d: amp.d, transform: centerAt(amp, COMPACT.vb / 2, COMPACT.vb / 2 + 0.4) },
    },
  };

  const body =
    '// AUTO-GENERATED oleh scripts/generate-icons.mjs — JANGAN diedit manual.\n' +
    '// Huruf sudah di-outline jadi path supaya monogram tidak bergantung webfont.\n' +
    '// Ubah bentuknya di scripts/generate-icons.mjs lalu jalankan: pnpm run icons\n\n' +
    `export const MONOGRAM = ${JSON.stringify(data, null, 2)} as const;\n`;

  mkdirSync(monogramDir, { recursive: true });
  writeFileSync(join(monogramDir, 'monogram.paths.ts'), body, 'utf8');
}

/* ==================================== Main ================================== */

const fonts = { serif: await loadFont('serif'), script: await loadFont('script') };

const vars = parseEnvFile(join(root, '.env'), TAG);
const groom = vars['GROOM_NAME'];
const bride = vars['BRIDE_NAME'];
if (!groom || !bride) {
  console.error(`[${TAG}] GROOM_NAME / BRIDE_NAME wajib terisi di .env (untuk OG cover).`);
  process.exit(1);
}

mkdirSync(publicDir, { recursive: true });
mkdirSync(imagesDir, { recursive: true });

// -- favicon vektor (compact, ikut prefers-color-scheme) --
writeFileSync(join(publicDir, 'favicon.svg'), assertClean(buildCompact({ scheme: 'css' }), 'favicon.svg'), 'utf8');

// -- raster compact: favicon-32 + .ico (16 & 32) --
const compact16 = await png(buildCompact({ px: 16 }), 'compact-16');
const compact32 = await png(buildCompact({ px: 32 }), 'compact-32');
writeFileSync(join(publicDir, 'favicon-32.png'), compact32);
writeFileSync(
  join(publicDir, 'favicon.ico'),
  buildIco([
    { size: 16, buffer: compact16 },
    { size: 32, buffer: compact32 },
  ])
);

// -- raster full: apple-touch + icon PWA --
writeFileSync(join(publicDir, 'apple-touch-icon.png'), await png(buildFull({ px: 180, ground: 'ivory' }), 'apple-touch-icon'));
writeFileSync(join(publicDir, 'icon-192.png'), await png(buildFull({ px: 192, ground: 'ivory' }), 'icon-192'));
writeFileSync(join(publicDir, 'icon-512.png'), await png(buildFull({ px: 512, ground: 'ivory' }), 'icon-512'));
writeFileSync(
  join(publicDir, 'icon-512-maskable.png'),
  await png(buildFull({ px: 512, ground: 'ivory', contentScale: 0.6, framed: true }), 'icon-512-maskable')
);

// -- OG cover, dengan floral yang sudah ada di-composite di atasnya --
const ogBase = await sharp(Buffer.from(assertClean(buildOgCover({ groom, bride }), 'og-cover')))
  .png()
  .toBuffer();
const OG_W = 1200;
const OG_H = 630;
const floral = [
  { file: 'leaf-sprig.svg', w: 300, left: 6, top: 336, rotate: 14, opacity: 0.5 },
  { file: 'bloom-a.svg', w: 148, left: 92, top: 452, rotate: 0, opacity: 0.85 },
  { file: 'bloom-b.svg', w: 100, left: 214, top: 512, rotate: 0, opacity: 0.8 },
  { file: 'blossom.svg', w: 56, left: 60, top: 470, rotate: 0, opacity: 0.7 },
  { file: 'leaf-sprig.svg', w: 300, left: 894, top: 8, rotate: 194, opacity: 0.5 },
  { file: 'bloom-b.svg', w: 148, left: 960, top: 40, rotate: 0, opacity: 0.85 },
  { file: 'bloom-a.svg', w: 100, left: 892, top: 8, rotate: 0, opacity: 0.8 },
  { file: 'blossom.svg', w: 56, left: 1088, top: 148, rotate: 0, opacity: 0.7 },
];
const overlays = [];
for (const f of floral) {
  let img = sharp(join(splashDir, f.file), { density: 300 }).resize({ width: f.w });
  if (f.rotate) img = img.rotate(f.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  // turunkan opacity dengan mengalikan alpha (blend dest-in)
  const buf = await img
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.round(f.opacity * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  // rotate memperbesar kanvas — clamp posisi supaya overlay tetap utuh di dalam kartu
  const meta = await sharp(buf).metadata();
  overlays.push({
    input: buf,
    left: Math.max(0, Math.min(f.left, OG_W - meta.width)),
    top: Math.max(0, Math.min(f.top, OG_H - meta.height)),
  });
}
const ogFinal = await sharp(ogBase)
  .composite(overlays)
  .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
  .toBuffer();
writeFileSync(join(imagesDir, 'og-cover.jpg'), ogFinal);

// -- path untuk komponen Angular --
writeMonogramPaths();

console.log(`[${TAG}] OK — favicon.svg/.ico, favicon-32, apple-touch-icon, icon-192/512(+maskable),`);
console.log(`[${TAG}]      assets/images/og-cover.jpg, dan monogram.paths.ts di-generate.`);
