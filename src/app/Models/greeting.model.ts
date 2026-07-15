export interface Greeting {
  timestamp: string;
  slug?: string;
  name: string;
  message: string;
  approved?: boolean;
}

export interface GreetingPayload {
  slug?: string;
  name: string;
  message: string;
}
