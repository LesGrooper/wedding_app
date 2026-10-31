import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { environment } from '../../environments/environment';
import { EventConfig } from '../Models/event.model';

/**
 * Acara yang sedang dibuka — satu build untuk beberapa acara
 * (`?acara=banjar`, `?acara=cimahi`, ...).
 *
 * URL-nya di-parse SEKALI oleh skrip inline di src/index.html, yang menaruh
 * `data-acara` di <html> sebelum paint pertama supaya tema warna di
 * src/styles.css langsung benar. Service ini hanya membaca atribut itu,
 * jadi CSS dan TS tidak mungkin berbeda pendapat soal acara mana.
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {

  /** Kunci acara yang valid, mis. 'banjar'. */
  readonly key:string;

  /** Tanggal, jadwal, dan lokasi acara aktif. */
  readonly current:EventConfig;

  constructor(
    @Inject(DOCUMENT) private doc:Document,
  ) {
    const events:Record<string, EventConfig> = environment.events;
    const root = this.doc.documentElement;
    const requested = root.getAttribute('data-acara') ?? '';

    this.key = requested in events ? requested : environment.defaultEvent;
    this.current = events[this.key];

    // Nilai tak dikenal (typo di link, atau acara belum diaktifkan di EVENTS)
    // jatuh ke acara default — diam-diam bagi tamu, jadi beri tanda saat dev.
    if (requested && requested !== this.key && !environment.production) {
      console.warn(`[EventService] ?acara=${requested} tidak dikenal — pakai "${this.key}". Cek EVENTS di .env.`);
    }

    // Tulis balik kunci yang valid supaya tema CSS ikut acara yang benar-benar
    // dipakai (mis. link ?acara=cimahi saat cimahi belum ada di EVENTS).
    root.setAttribute('data-acara', this.key);
    this.syncThemeColor(root);
  }

  /** Warna chrome browser (address bar di HP) mengikuti ivory tema aktif. */
  private syncThemeColor(root:HTMLElement):void {
    const meta = this.doc.querySelector('meta[name="theme-color"]');
    const channels = getComputedStyle(root).getPropertyValue('--rgb-ivory').trim();
    if (meta && channels) {
      meta.setAttribute('content', `rgb(${channels.split(/\s+/).join(', ')})`);
    }
  }

}
