export interface Greeting {
  timestamp: string;
  slug?: string;
  name: string;
  message: string;
  approved?: boolean;
}

export interface GreetingPayload {
  /** Kunci acara asal ucapan. Dinding ucapan tetap digabung; ini untuk arsip di Sheet. */
  event: string;
  slug?: string;
  name: string;
  message: string;
}
