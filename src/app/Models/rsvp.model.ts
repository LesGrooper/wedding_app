export type RsvpStatus = 'hadir' | 'tidak' | 'mungkin';

export interface RsvpPayload {
  slug: string;
  name: string;
  status: RsvpStatus;
  partner_count: number;
  message?: string;
  user_agent?: string;
}
