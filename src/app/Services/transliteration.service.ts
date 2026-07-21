import { Injectable, signal } from '@angular/core';

/**
 * Dwibahasa ID/EN. Semua copy/label/frasa undangan ada di sini dalam satu
 * kamus language-first (TRANSLATIONS.id / TRANSLATIONS.en) dengan key
 * ber-prefix section supaya unik. Data per-pasangan (nama, tanggal, venue,
 * bank) tetap di .env. Bahasa aktif = signal → ganti bahasa me-render ulang
 * binding yang memanggil trans() di template.
 *
 * Prinsip: nilai `id` = Indonesia penuh, `en` = Inggris penuh (tidak dicampur).
 *
 * Pemakaian di komponen:
 *   constructor(public ts: TransliterationService) {}
 *   trans(key: string, ...p: string[]) { return this.ts.trans(key, ...p); }
 *   // template: {{ trans('hero_save_the_date') }}
 */

export type Lang = 'id' | 'en';

/** Nilai per key: string, atau fungsi berparam (mis. nama orang tua). */
type Value = string | ((...p: string[]) => string);

export const TRANSLATIONS: Record<Lang, Record<string, Value>> = {
  id: {
    // splash
    splash_the_wedding_of: 'Undangan Pernikahan',
    splash_welcome: 'Selamat Datang',
    splash_verse: '“Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari (jenis) dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.”',
    splash_verse_ref: 'QS. Ar-Rum : 21',
    splash_to: 'Kepada Yth.',
    splash_apology: 'Mohon maaf apabila ada salah penulisan nama',
    splash_open: 'Buka Undangan',
    // hero
    hero_save_the_date: 'Simpan Tanggal',
    hero_for_guest: 'Untuk',
    // couple
    couple_title: 'Mempelai',
    couple_groom_parents: (f, m) => `Putra dari Bapak ${f} & Ibu ${m}`,
    couple_bride_parents: (f, m) => `Putri dari Bapak ${f} & Ibu ${m}`,
    // countdown
    countdown_title: 'Menghitung Hari',
    countdown_akad: 'Akad Nikah',
    countdown_reception: 'Resepsi',
    countdown_days: 'Hari',
    countdown_hours: 'Jam',
    countdown_minutes: 'Menit',
    countdown_seconds: 'Detik',
    // story
    story_title: 'Kisah Cinta Kami',
    // gallery
    gallery_title: 'Momen Kami',
    // location
    location_title: 'Lokasi Acara',
    location_open_maps: 'Buka di Google Maps',
    // rsvp
    rsvp_title: 'Konfirmasi Kehadiran',
    rsvp_thanks_title: 'Terima kasih!',
    rsvp_thanks_body: 'Konfirmasi kehadiran Anda sudah kami terima.',
    rsvp_label_name: 'Nama',
    rsvp_label_attendance: 'Kehadiran',
    rsvp_opt_attend: 'Hadir',
    rsvp_label_guests: 'Jumlah Tamu',
    rsvp_submit: 'Kirim Konfirmasi',
    rsvp_submitting: 'Mengirim...',
    rsvp_toast_ok: 'Konfirmasi terkirim. Terima kasih!',
    rsvp_err_network: 'Koneksi terputus, silakan coba lagi.',
    rsvp_err_timeout: 'Server lambat merespons, coba lagi.',
    rsvp_err_generic: 'Gagal mengirim konfirmasi. Coba lagi nanti.',
    // gift
    gift_title: 'Hadiah Pernikahan',
    gift_intro: 'Doa restu Anda adalah hadiah terindah bagi kami. Namun bila berkenan memberi tanda kasih, kami sediakan informasi berikut.',
    gift_on_behalf: 'a.n.',
    gift_copy: 'Salin Nomor',
    gift_toast_copied: 'Nomor rekening disalin',
    gift_toast_copy_fail: 'Gagal menyalin, silakan salin manual.',
    // greetings
    greetings_title: 'Ucapan & Doa',
    greetings_ph_name: 'Nama Anda',
    greetings_ph_message: 'Tulis ucapan & doa...',
    greetings_submit: 'Kirim Ucapan',
    greetings_submitting: 'Mengirim...',
    greetings_loading: 'Memuat ucapan...',
    greetings_empty: 'Belum ada ucapan. Jadi yang pertama!',
    greetings_toast_ok: 'Ucapan terkirim. Terima kasih!',
    greetings_toast_rate: 'Terlalu banyak kiriman, coba beberapa saat lagi.',
    greetings_err_network: 'Koneksi terputus, silakan coba lagi.',
    greetings_err_timeout: 'Server lambat merespons, coba lagi.',
    greetings_err_generic: 'Gagal mengirim ucapan.',
    greetings_just_now: 'baru saja',
    greetings_min_ago: (n) => `${n} menit lalu`,
    greetings_hour_ago: (n) => `${n} jam lalu`,
    greetings_day_ago: (n) => `${n} hari lalu`,
    // footer
    footer_closing: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.',
    footer_thank_you: 'Terima Kasih',
    footer_thanks_body: 'Atas kehadiran & doa restu Anda',
  },

  en: {
    // splash
    splash_the_wedding_of: 'The Wedding of',
    splash_welcome: 'Welcome',
    splash_verse: '“And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.”',
    splash_verse_ref: 'The Holy Qur’an — Ar-Rum: 21',
    splash_to: 'Dear',
    splash_apology: 'We apologize for any misspelling of your name',
    splash_open: 'Open Invitation',
    // hero
    hero_save_the_date: 'Save the Date',
    hero_for_guest: 'To',
    // couple
    couple_title: 'The Couple',
    couple_groom_parents: (f, m) => `Son of Mr. ${f} & Mrs. ${m}`,
    couple_bride_parents: (f, m) => `Daughter of Mr. ${f} & Mrs. ${m}`,
    // countdown
    countdown_title: 'Counting the Days',
    countdown_akad: 'Ceremony',
    countdown_reception: 'Reception',
    countdown_days: 'Days',
    countdown_hours: 'Hours',
    countdown_minutes: 'Minutes',
    countdown_seconds: 'Seconds',
    // story
    story_title: 'Our Love Story',
    // gallery
    gallery_title: 'Our Moments',
    // location
    location_title: 'Location',
    location_open_maps: 'Open in Google Maps',
    // rsvp
    rsvp_title: 'RSVP',
    rsvp_thanks_title: 'Thank you!',
    rsvp_thanks_body: 'We have received your attendance confirmation.',
    rsvp_label_name: 'Name',
    rsvp_label_attendance: 'Attendance',
    rsvp_opt_attend: 'Attending',
    rsvp_label_guests: 'Number of Guests',
    rsvp_submit: 'Send Confirmation',
    rsvp_submitting: 'Sending...',
    rsvp_toast_ok: 'Confirmation sent. Thank you!',
    rsvp_err_network: 'Connection lost, please try again.',
    rsvp_err_timeout: 'The server is slow to respond, try again.',
    rsvp_err_generic: 'Failed to send confirmation. Try again later.',
    // gift
    gift_title: 'Wedding Gift',
    gift_intro: 'Your blessing is the most beautiful gift for us. But should you wish to send a token of love, here is the information.',
    gift_on_behalf: 'On behalf of',
    gift_copy: 'Copy Number',
    gift_toast_copied: 'Account number copied',
    gift_toast_copy_fail: 'Copy failed, please copy manually.',
    // greetings
    greetings_title: 'Wishes & Prayers',
    greetings_ph_name: 'Your Name',
    greetings_ph_message: 'Write your wishes & prayers...',
    greetings_submit: 'Send Wish',
    greetings_submitting: 'Sending...',
    greetings_loading: 'Loading wishes...',
    greetings_empty: 'No wishes yet. Be the first!',
    greetings_toast_ok: 'Wish sent. Thank you!',
    greetings_toast_rate: 'Too many submissions, please try again shortly.',
    greetings_err_network: 'Connection lost, please try again.',
    greetings_err_timeout: 'The server is slow to respond, try again.',
    greetings_err_generic: 'Failed to send wish.',
    greetings_just_now: 'just now',
    greetings_min_ago: (n) => `${n} min ago`,
    greetings_hour_ago: (n) => `${n} hr ago`,
    greetings_day_ago: (n) => `${n} days ago`,
    // footer
    footer_closing: 'It would be an honor and a joy for us if you would attend and give your blessing to the bride and groom.',
    footer_thank_you: 'Thank You',
    footer_thanks_body: 'For your presence & blessings',
  },
};

/** Bab cerita cinta — array per bahasa (diakses lewat stories()). */
export interface StoryChapter { label: string; text: string; }
const STORY_CHAPTERS: Record<Lang, StoryChapter[]> = {
  id: [
    { label: 'Di Kampus', text: 'Semuanya dimulai di kampus. Saat itu, kami hanya dua orang yang kebetulan berada di kelas yang sama. Sekedar tahu, belum saling mencari.' },
    { label: 'Dua Tahun Kemudian', text: 'Dua tahun kemudian, kesempatan menjadi panitia ospek membuat kami menjadi lebih dekat. Ada banyak obrolan dan momen kecil yang menyenangkan. Sayangnya, cerita berhenti sampai di situ, dan kami kembali sibuk dengan jalan masing – masing.' },
    { label: 'Akhir 2025', text: 'Akhir tahun 2025, kami dipertemukan kembali. Kali ini rasanya jauh lebih sederhana, tidak ada yang terburu – buru, semuanya terasa pas.' },
    { label: 'Hari Ini', text: 'Yang sempat tertuda bukan berarti berakhir. Hari ini kami memulai kisah, sekarang dan selamanya.' },
  ],
  en: [
    { label: 'On Campus', text: 'It all began on campus. Back then, we were just two people who happened to be in the same class. We knew of each other, but were not yet looking.' },
    { label: 'Two Years Later', text: 'Two years later, becoming orientation committee members brought us closer. There were many conversations and small, pleasant moments. Sadly, the story stopped there, and we went back to our own busy paths.' },
    { label: 'Late 2025', text: 'In late 2025, we were brought together again. This time it felt far simpler — nothing rushed, everything felt right.' },
    { label: 'Today', text: 'What was once delayed does not mean it has ended. Today we begin our story, now and forever.' },
  ],
};

@Injectable({ providedIn: 'root' })
export class TransliterationService {

  /** Bahasa aktif. Private supaya template tak menyentuh lang() langsung. */
  private _lang = signal<Lang>(this.readInitial());

  /**
   * Ambil teks `key` sesuai bahasa aktif. Nilai fungsi dipanggil dengan
   * `params`. Fallback: entri id, lalu key mentah.
   */
  trans(key: string, ...params: string[]): string {
    const value = TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.id[key];
    if (value == null) return key;
    return typeof value === 'function' ? value(...params) : value;
  }

  /** Bab cerita cinta untuk bahasa aktif. */
  stories(): StoryChapter[] {
    return STORY_CHAPTERS[this._lang()];
  }

  /** State untuk tombol toggle (menghindari lang() di template). */
  isActive(l: Lang): boolean {
    return this._lang() === l;
  }

  setLang(l: Lang): void {
    this._lang.set(l);
    try { localStorage.setItem('lang', l); } catch { /* non-secure / SSR */ }
  }

  toggle(): void {
    this.setLang(this._lang() === 'id' ? 'en' : 'id');
  }

  private readInitial(): Lang {
    try {
      const s = localStorage.getItem('lang');
      if (s === 'id' || s === 'en') return s;
    } catch { /* ignore */ }
    return 'id';
  }

}
