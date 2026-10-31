// Parser .env bersama — dipakai oleh generate-env.mjs & generate-icons.mjs.
// Format: KEY=VALUE per baris, '#' di awal baris = komentar,
// nilai boleh dikutip dengan " atau ' (kutipnya dilepas).

import { readFileSync } from 'node:fs';

/**
 * Baca & parse file .env menjadi objek datar { KEY: 'value' }.
 * @param {string} envPath  path absolut ke file .env
 * @param {string} tag      prefix log pemanggil, mis. 'generate-icons'
 * @param {{optional?: boolean}} opts  optional: kembalikan null (bukan exit)
 *        kalau file tidak ada — dipakai saat build di CI/Vercel, yang
 *        nilainya datang dari Environment Variables, bukan dari file.
 * @returns {Record<string, string> | null}
 */
export function parseEnvFile(envPath, tag = 'env', { optional = false } = {}) {
  let raw;
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    if (optional) return null;
    console.error(`[${tag}] File .env tidak ditemukan di root project.`);
    console.error(`[${tag}] Salin .env.example menjadi .env lalu isi nilainya.`);
    process.exit(1);
  }

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

  return vars;
}
