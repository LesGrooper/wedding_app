// Generate src/environments/environment.ts & environment.prod.ts dari .env
// Dipanggil otomatis oleh `pnpm start` / `pnpm run build` (lihat package.json),
// atau manual: pnpm run config:env

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnvFile } from './lib/env.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const outDir = join(root, 'src', 'environments');

// Dua sumber nilai:
//   .env            — dipakai saat kerja lokal, dan menang kalau keduanya ada.
//   process.env     — dipakai saat build di Vercel/CI, yang tidak punya file
//                     .env karena file itu di-gitignore (berisi data pribadi).
const fileVars = parseEnvFile(envPath, 'generate-env', { optional: true });
if (!fileVars && !process.env['EVENTS']) {
  console.error('[generate-env] Tidak ada file .env, dan EVENTS juga tidak ada di environment variable.');
  console.error('[generate-env] Lokal : salin .env.example jadi .env lalu isi nilainya.');
  console.error('[generate-env] Vercel: isi Project Settings → Environment Variables (daftar kuncinya ada di .env.example).');
  process.exit(1);
}
if (!fileVars) console.log('[generate-env] File .env tidak ada — memakai environment variable (mode CI/Vercel).');
const vars = { ...process.env, ...(fileVars ?? {}) };

/* ---------- Ambil nilai (dengan override *_PROD opsional) ---------- */

const missing = [];

function get(key, { prod = false } = {}) {
  const v = (prod && vars[`${key}_PROD`]) || vars[key];
  if (v == null || v === '') missing.push(key);
  return v ?? '';
}

/* ---------- Acara (Banjar, Cimahi, ...) — satu build, dipilih via ?acara= ---------- */

// Kunci lama tanpa prefix dari versi satu-acara. Sengaja TIDAK di-fallback:
// kalau diam-diam dipakai, satu acara bisa tampil dengan tanggal/lokasi acara lain.
const LEGACY_EVENT_KEYS = [
  'EVENT_DATE', 'AKAD_TIME', 'RECEPTION_TIME',
  'VENUE_NAME', 'VENUE_ADDRESS', 'VENUE_MAPS_EMBED_URL', 'VENUE_MAPS_OPEN_URL',
];
const legacy = LEGACY_EVENT_KEYS.filter((k) => k in vars || `${k}_PROD` in vars);
if (legacy.length) {
  console.error(`[generate-env] Kunci lama tanpa prefix acara masih ada di .env: ${legacy.join(', ')}`);
  console.error('[generate-env] Ganti jadi ber-prefix per acara, mis. EVENT_DATE → BANJAR_EVENT_DATE (lihat .env.example).');
  process.exit(1);
}

// Urutan pertama = acara default (link tanpa ?acara=).
// Hanya huruf a-z: harus cocok dengan regex skrip inline di src/index.html.
const eventKeys = (vars['EVENTS'] ?? '')
  .split(',')
  .map((k) => k.trim().toLowerCase())
  .filter(Boolean);
if (!eventKeys.length) missing.push('EVENTS');
const badKeys = eventKeys.filter((k) => !/^[a-z]+$/.test(k));
if (badKeys.length) {
  console.error(`[generate-env] Kunci acara hanya boleh huruf a-z (tanpa angka/strip/spasi): ${badKeys.join(', ')}`);
  process.exit(1);
}

function buildEvent(key, production) {
  const p = key.toUpperCase();
  return {
    eventDate: get(`${p}_EVENT_DATE`, { prod: production }),
    // Opsional — ngunduh mantu tidak ada akad; kolomnya disembunyikan di countdown.
    akadTime: vars[`${p}_AKAD_TIME`] ?? '',
    receptionTime: get(`${p}_RECEPTION_TIME`),
    venue: {
      name: get(`${p}_VENUE_NAME`),
      address: get(`${p}_VENUE_ADDRESS`),
      mapsEmbedUrl: get(`${p}_VENUE_MAPS_EMBED_URL`),
      mapsOpenUrl: get(`${p}_VENUE_MAPS_OPEN_URL`),
    },
  };
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
    defaultEvent: eventKeys[0] ?? '',
    events: Object.fromEntries(eventKeys.map((k) => [k, buildEvent(k, production)])),
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

console.log(
  `[generate-env] OK — environment.ts & environment.prod.ts di-generate ` +
  `(acara: ${eventKeys.join(', ')} · default ${dev.defaultEvent} · ${dev.gift.length} rekening gift).`,
);
