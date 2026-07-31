# Wedding Invitation 💍

Undangan pernikahan digital — Angular 18 (standalone) + Tailwind CSS. RSVP dan ucapan tamu tersimpan ke **Google Sheets** melalui backend **Google Apps Script** (tanpa server sendiri, tanpa database).

## Stack

- Angular 18 (standalone components), TypeScript, RxJS
- Tailwind CSS 3
- date-fns (countdown)
- pnpm sebagai package manager
- Google Apps Script Web App → Google Sheets (backend RSVP, ucapan, & daftar tamu)

## Setup awal

Prasyarat: Node.js 18+ dan [pnpm](https://pnpm.io).

```powershell
pnpm install

# Salin template konfigurasi lalu isi nilainya
cp .env.example .env

# Jalankan dev server → http://localhost:4200
pnpm start
```

## Konfigurasi (`.env`)

Seluruh konfigurasi undangan ada di **`.env`** (tidak ikut git). File `src/environments/environment.ts` dan `environment.prod.ts` **di-generate otomatis** dari `.env` oleh `scripts/generate-env.mjs` setiap kali `pnpm start` / `pnpm run build` — **jangan edit kedua file itu manual**, perubahanmu akan tertimpa.

| Variabel | Isi |
|---|---|
| `APPS_SCRIPT_URL` | URL `/exec` deployment Apps Script (lihat bagian Backend) |
| `EVENT_DATE` | Tanggal & jam acara, ISO 8601 (`2026-12-26T10:00:00+07:00`) |
| `GROOM_*` / `BRIDE_*` | Nama, orang tua, dan path foto mempelai |
| `VENUE_*` | Nama gedung, alamat, URL Google Maps (embed & open) |
| `STORY_n_LABEL` / `STORY_n_TEXT` | Love story per bab, urut dari `n = 1` |

Butuh nilai berbeda khusus build production? Tambahkan suffix `_PROD`, contoh: `EVENT_DATE_PROD=...` atau `APPS_SCRIPT_URL_PROD=...`.

Setelah mengubah `.env` saat dev server sedang jalan, jalankan `pnpm run config:env` agar file environment di-generate ulang.

## Backend Google Sheets (Apps Script)

Kode backend ada di [`apps-script/Code.gs`](apps-script/Code.gs); panduan lengkap di [`apps-script/README.md`](apps-script/README.md). Ringkasnya:

1. Buat Spreadsheet dengan 3 tab: `Guests`, `RSVP`, `Greetings` (header lihat panduan).
2. Paste `Code.gs` ke [script.google.com](https://script.google.com), isi `SHEET_ID`.
3. Deploy → **Web app** → Execute as: **Me** → Who has access: **Anyone** (harus "Anyone", bukan "Anyone with Google account" — kalau salah, semua request dilempar ke halaman login Google).
4. Copy URL `/exec` ke `APPS_SCRIPT_URL` di `.env`.

⚠️ Setiap edit `Code.gs` wajib **redeploy** (Deploy → Manage deployments → Edit → Version: New). Save saja tidak cukup; URL `/exec` tetap sama.

Smoke test cepat (PowerShell):

```powershell
$URL = "https://script.google.com/macros/s/.../exec"
curl.exe -sL "$URL`?action=ping"                                  # {"ok":true,...}
curl.exe -sL $URL -d "action=rsvp&slug=test&name=Test&status=hadir&partner_count=1"
curl.exe -sL $URL -d "action=greeting&slug=test&name=Test&message=Selamat"
curl.exe -sL "$URL`?action=greetings"
```

> Jangan pakai `curl -X POST` bersama `-L` — redirect 302 Apps Script akan di-follow dengan POST tanpa body dan berakhir error 411 (padahal datanya tersimpan). Cukup `-d`, curl otomatis POST.

## Script pnpm

| Perintah | Fungsi |
|---|---|
| `pnpm start` | Generate env + dev server di `http://localhost:4200` |
| `pnpm run build` | Generate env + build **production** → `dist/wedding-invitation/browser` |
| `pnpm run build:dev` | Build development (tanpa minify, dengan sourcemap) |
| `pnpm run watch` | Build development mode watch |
| `pnpm run test` | Unit test via Karma |
| `pnpm run config:env` | Generate ulang `environment.*.ts` dari `.env` saja |
| `pnpm run icons` | Generate ulang brand mark: favicon, icon PWA, OG cover (lihat bawah) |

## Brand mark & icon

Monogram **R & A** adalah satu-satunya sumber identitas visual: favicon, icon PWA/home-screen, dan gambar preview link. Semuanya di-generate dari `scripts/generate-icons.mjs`:

```
pnpm run icons
```

Menghasilkan → `public/favicon.svg` · `favicon.ico` (16+32) · `favicon-32.png` · `apple-touch-icon.png` (180) · `icon-192.png` · `icon-512.png` · `icon-512-maskable.png` · `public/assets/images/og-cover.jpg` (1200×630, memuat nama & tanggal dari `.env`) · `src/app/Component/monogram/monogram.paths.ts` (dipakai `<app-monogram>` di splash & hero).

Catatan:

- **Tidak** ikut `pnpm run build` — aset icon nyaris tidak pernah berubah dan build tidak boleh butuh jaringan. Jalankan manual, lalu **commit hasilnya**.
- Sekali jalan pertama, dua font TTF (Cormorant Garamond & Great Vibes, OFL-1.1) diunduh ke `scripts/fonts/` yang di-`.gitignore`. Kalau jaringan diblokir, unduh manual ke folder itu — pesan errornya menyebutkan URL-nya.
- Huruf di-**outline jadi `<path>`**, bukan `<text>`: favicon SVG dirender di luar konteks dokumen sehingga webfont Google Fonts tidak ikut dimuat.

### ⚠️ Wajib diisi saat deploy

`src/index.html` memakai placeholder `https://CHANGEME.example/` pada `og:url` dan `og:image`. **Ganti dengan domain asli** — WhatsApp dan Facebook tidak me-resolve path relatif pada `og:image`, jadi selama masih placeholder kartu preview link tidak akan muncul.

## Link undangan personal

Nama tamu diambil dari query param `?to=`:

```
https://domain-kamu.com/?to=andi-budi     → "Andi Budi"
https://domain-kamu.com/?to=andi+keluarga → "Andi & Keluarga"
```

Tanpa `?to=`, sapaan fallback "Tamu Undangan" dipakai. Slug juga ikut terkirim di RSVP/ucapan sehingga bisa dicocokkan dengan tab `Guests` di Spreadsheet.

## Keamanan & git

- `.env`, `src/environments/environment*.ts`, dan file kredensial `wedding-app-*.json` sudah di-`.gitignore` — **jangan pernah di-commit**.
- Nilai konfigurasi tetap terlihat di bundle JavaScript publik setelah deploy (wajar untuk data undangan). `.env` hanya menjaga data pribadi tidak masuk riwayat git.
- File service account Google Cloud **tidak dibutuhkan** app ini — backend memakai Apps Script yang berjalan sebagai akun pemilik. Kalau ada key yang pernah terekspos, nonaktifkan di GCP Console (IAM → Service Accounts → Keys).

## Source Backgrorund Music : 
[`"Till There Was You", solo acoustic guitar`](www.youtube.com/watch?v=kSNogCdocvE&list=RDkSNogCdocvE)
