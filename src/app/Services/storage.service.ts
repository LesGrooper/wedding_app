import { Injectable } from '@angular/core';

/**
 * Thin localStorage wrapper. The async signature mirrors the
 * mobile-frontend storage service so consumers can `await` calls
 * without caring whether the backing store is sync or async.
 *
 * No values are encrypted here — this site only stores non-sensitive
 * flags like `rsvp-submitted-<slug>` to prevent double-submit.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }
}

/**
 * Persist a value as JSON under `key`. Swallows quota / private-mode
 * errors so the caller never has to wrap this in try/catch.
 */
export async function SetStorage(key:string, value:any):Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or private mode — silently skip */
  }
}

/**
 * Read a value previously stored via SetStorage. Returns `null` when
 * the key is missing or when the stored payload is not valid JSON.
 */
export async function GetStorage<T = any>(key:string):Promise<T | null> {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

/**
 * Remove a single key.
 */
export async function RemoveStorage(key:string):Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

/**
 * Wipe every key. Use sparingly — this clears all of localStorage,
 * not just the keys this app owns.
 */
export async function ClearStorage():Promise<void> {
  try {
    localStorage.clear();
  } catch {
    /* noop */
  }
}

/**
 * Storage key used to remember that a given guest already submitted
 * their RSVP, so we can disable the form on subsequent visits.
 * Falls back to "anon" when no slug is present in the URL.
 */
export const RSVP_FLAG = (slug:string) => `rsvp-submitted-${slug || 'anon'}`;
