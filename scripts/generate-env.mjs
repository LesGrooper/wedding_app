// Generate src/environments/environment.ts & environment.prod.ts dari .env
// Dipanggil otomatis oleh `pnpm start` / `pnpm run build` (lihat package.json),
// atau manual: pnpm run config:env

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const outDir = join(root, 'src', 'environments');

let raw;
try {
  raw = readFileSync(envPath, 'utf8');
} catch {
  console.error('[generate-env] File .env tidak ditemukan di root project.');
  console.error('[generate-env] Salin .env.example menjadi .env lalu isi nilainya.');
  process.exit(1);
}

/* ---------- Parse .env (KEY=VALUE per baris, # = komentar) ---------- */

const vars = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    value = value.slice(1, -1);
  }
  vars[key] = value;
}

/* ---------- Ambil nilai (dengan override *_PROD opsional) ---------- */

const missing = [];

function get(key, { prod = false } = {}) {
  const v = (prod && vars[`${key}_PROD`]) || vars[key];
  if (v == null || v === '') missing.push(key);
  return v ?? '';
}

// Rekening wedding gift — atas nama otomatis dari GROOM_NAME / BRIDE_NAME.
// Entri di-skip kalau bank & nomornya kosong (mis. cuma pakai 1 rekening).
function buildGift() {
  const accounts = [
    { bank: vars['GIFT_GROOM_BANK'], number: vars['GIFT_GROOM_NUMBER'], name: vars['GROOM_NAME'] },
    { bank: vars['GIFT_BRIDE_BANK'], number: vars['GIFT_BRIDE_NUMBER'], name: vars['BRIDE_NAME'] },
  ];
  return accounts
    .filter((a) => a.bank || a.number)
    .map((a) => ({ bank: a.bank ?? '', number: a.number ?? '', name: a.name ?? '' }));
}

function buildEnvironment(production) {
  return {
    production,
    appsScriptUrl: get('APPS_SCRIPT_URL', { prod: production }),
    eventDate: get('EVENT_DATE', { prod: production }),
    events: {
      akadTime: get('AKAD_TIME'),
      receptionTime: get('RECEPTION_TIME'),
    },
    groom: {
      name: get('GROOM_NAME'),
      father: get('GROOM_FATHER'),
      mother: get('GROOM_MOTHER'),
      photo: get('GROOM_PHOTO'),
    },
    bride: {
      name: get('BRIDE_NAME'),
      father: get('BRIDE_FATHER'),
      mother: get('BRIDE_MOTHER'),
      photo: get('BRIDE_PHOTO'),
    },
    venue: {
      name: get('VENUE_NAME'),
      address: get('VENUE_ADDRESS'),
      mapsEmbedUrl: get('VENUE_MAPS_EMBED_URL'),
      mapsOpenUrl: get('VENUE_MAPS_OPEN_URL'),
    },
    gift: buildGift(),
  };
}

/* ---------- Tulis file ---------- */

const banner =
  '// AUTO-GENERATED dari .env oleh scripts/generate-env.mjs — JANGAN diedit manual.\n' +
  '// Ubah nilainya di .env lalu jalankan: pnpm run config:env\n';

function render(env) {
  return `${banner}export const environment = ${JSON.stringify(env, null, 2)};\n`;
}

const dev = buildEnvironment(false);
const prod = buildEnvironment(true);

if (missing.length) {
  console.error(`[generate-env] Variabel kosong/hilang di .env: ${[...new Set(missing)].join(', ')}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'environment.ts'), render(dev), 'utf8');
writeFileSync(join(outDir, 'environment.prod.ts'), render(prod), 'utf8');

console.log(`[generate-env] OK — environment.ts & environment.prod.ts di-generate (${dev.gift.length} rekening gift).`);
