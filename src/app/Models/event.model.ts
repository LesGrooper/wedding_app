export interface EventVenue {
  name: string;
  address: string;
  mapsEmbedUrl: string;
  mapsOpenUrl: string;
}

/**
 * Data satu acara (Banjar, Cimahi, ...) — di-generate dari blok
 * `<KUNCI>_*` di .env oleh scripts/generate-env.mjs.
 */
export interface EventConfig {
  /** ISO 8601 dengan timezone; target countdown. */
  eventDate: string;
  /** Teks bebas; string kosong = tidak ada akad (mis. ngunduh mantu). */
  akadTime: string;
  receptionTime: string;
  venue: EventVenue;
}
