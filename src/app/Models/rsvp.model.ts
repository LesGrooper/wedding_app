export type RsvpStatus = 'hadir' | 'tidak' | 'mungkin';

export interface RsvpPayload {
  /** Kunci acara (mis. 'banjar', 'cimahi') — supaya rekap RSVP per acara terpisah. */
  event: string;
  slug: string;
  name: string;
  status: RsvpStatus;
  partner_count: number;
  message?: string;
  user_agent?: string;
}
