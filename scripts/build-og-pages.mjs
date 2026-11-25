// Preview link per acara — dijalankan otomatis setelah `ng build` (lihat package.json).
//
// Crawler WhatsApp/Facebook hanya membaca HTML mentah dan TIDAK menjalankan JS,
// jadi ?acara= tidak bisa mengganti og:image dari browser. Jalan keluarnya
// statis: satu HTML per acara, dipilih Vercel dari query string.
//
//   dist/.../index.html ──┬─► app.html      (default, blok og-acara dibuang)
//                         └─► cimahi.html   (meta dari blok og-acara ditimpa)
//
// index.html SENGAJA dihapus dari output: Vercel memeriksa filesystem sebelum
// rewrites, jadi selama index.html ada, `/` selalu dilayani olehnya dan rewrite
// `/?acara=cimahi → /cimahi.html` tidak pernah tersentuh. Tanpa index.html,
// semua `/` lewat rewrites di vercel.json.
//
// Config-nya di src/index.html (<script type="application/json" id="og-acara">).

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAG = 'build-og-pages';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const outDir = join(root, vercel.outputDirectory);
const DEFAULT_PAGE = 'app.html';

const fail = (msg) => {
  console.error(`[${TAG}] ${msg}`);
  process.exit(1);
};

const indexPath = join(outDir, 'index.html');
if (!existsSync(indexPath)) fail(`${indexPath} tidak ada — jalankan ng build dulu.`);
const html = readFileSync(indexPath, 'utf8');

/* ---------- Config dari blok og-acara ---------- */

const BLOCK = /\s*<script type="application\/json" id="og-acara">([\s\S]*?)<\/script>/;
const m = BLOCK.exec(html);
if (!m) fail('Blok <script type="application/json" id="og-acara"> tidak ditemukan di index.html.');

let config;
try {
  config = JSON.parse(m[1]);
} catch (e) {
  fail(`JSON di blok og-acara tidak valid: ${e.message}`);
}
const base = html.replace(BLOCK, '');

const metaRe = (name) =>
  new RegExp(`(<meta\\s+(?:property|name)="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content=")[^"]*(")`);

const ogUrl = /<meta\s+property="og:url"\s+content="([^"]*)"/.exec(base)?.[1] ?? '';
if (!/^https?:\/\//.test(ogUrl)) fail(`og:url di index.html harus URL absolut, sekarang: "${ogUrl}".`);

/* ---------- Pastikan vercel.json punya rewrite yang cocok ---------- */

const rewrites = vercel.rewrites ?? [];
const hasRewrite = (key) =>
  rewrites.some(
    (r) =>
      r.source === '/' &&
      r.destination === `/${key}.html` &&
      (r.has ?? []).some((h) => h.type === 'query' && h.key === 'acara' && h.value === key)
  );
const catchAllIdx = rewrites.findIndex((r) => r.source === '/(.*)' && r.destination === `/${DEFAULT_PAGE}`);
if (catchAllIdx === -1) fail(`vercel.json butuh rewrite catch-all { "source": "/(.*)", "destination": "/${DEFAULT_PAGE}" }.`);

/* ---------- Tulis halaman per acara ---------- */

const esc = (s) => String(s).replace(/&(?!amp;|quot;|lt;|gt;)/g, '&amp;').replace(/"/g, '&quot;');

for (const [key, metas] of Object.entries(config)) {
  if (!/^[a-z]+$/.test(key)) fail(`Kunci acara "${key}" hanya boleh huruf a-z (samakan dengan EVENTS).`);
  if (!hasRewrite(key)) {
    fail(
      `vercel.json belum punya rewrite untuk "${key}". Tambahkan SEBELUM catch-all:\n` +
        `  { "source": "/", "has": [{ "type": "query", "key": "acara", "value": "${key}" }], "destination": "/${key}.html" }`
    );
  }
  const idx = rewrites.findIndex((r) => r.destination === `/${key}.html`);
  if (idx > catchAllIdx) fail(`Rewrite "${key}" di vercel.json harus di ATAS catch-all /(.*).`);

  const values = { 'og:url': `${ogUrl.replace(/\/+$/, '')}/?acara=${key}`, ...metas };
  let page = base.replace(/<html(\s[^>]*)?>/, (tag) => tag.replace(/>$/, ` data-acara="${key}">`));

  for (const [name, raw] of Object.entries(values)) {
    let value = raw;
    if (name === 'og:image' && !/^https?:\/\//.test(value)) {
      if (!existsSync(join(outDir, value))) fail(`[${key}] ${value} tidak ada di output build — sudah \`pnpm run icons\` & commit?`);
      value = new URL(value, ogUrl).href;
    }
    const re = metaRe(name);
    if (!re.test(page)) fail(`[${key}] <meta property/name="${name}"> tidak ada di index.html — tidak bisa ditimpa.`);
    page = page.replace(re, (_, a, b) => `${a}${esc(value)}${b}`);
  }

  writeFileSync(join(outDir, `${key}.html`), page);
  console.log(`[${TAG}] ${key}.html  ← ${Object.keys(values).join(', ')}`);
}

writeFileSync(join(outDir, DEFAULT_PAGE), base);
unlinkSync(indexPath);
console.log(`[${TAG}] ${DEFAULT_PAGE} (default) — index.html dihapus supaya rewrites vercel.json berlaku untuk /.`);
