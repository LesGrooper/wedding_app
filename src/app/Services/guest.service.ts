import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { Guest } from '../Models/guest.model';

/**
 * Holds the personalized guest derived from the `?to=<slug>` query
 * parameter. Components consume `currentGuest$` to render the right
 * name on the splash, hero, and forms.
 */
@Injectable({
  providedIn: 'root'
})
export class GuestService {

  /**
   * Backing subject for the resolved guest. `null` until the route
   * has been read for the first time.
   */
  private guest$:BehaviorSubject<Guest | null> = new BehaviorSubject<Guest | null>(null);

  /**
   * Public stream consumed via async pipe in templates.
   */
  readonly currentGuest$:Observable<Guest | null> = this.guest$.asObservable();

  constructor() { }

  /**
   * Wire the service to the active route so each `?to=` change
   * propagates to all subscribers. Called once from AppComponent.
   */
  initFromRoute(route:ActivatedRoute):void {
    route.queryParamMap.subscribe((params) => {
      const slug = (params.get('to') || '').trim();
      this.guest$.next({
        slug,
        name: this.decodeSlugToName(slug),
        partnerCount: 1,
      });
    });
  }

  /**
   * Convenience accessor used outside async contexts.
   */
  getSlug():string {
    return this.guest$.value?.slug ?? '';
  }

  /**
   * Convenience accessor used outside async contexts. Falls back to
   * the generic salutation when no slug was provided.
   */
  getName():string {
    return this.guest$.value?.name ?? 'Tamu Undangan';
  }

  /**
   * Turn a URL slug like `andi-budi` into `Andi Budi`.
   * `+` is treated as an ampersand separator so `andi+budi` →
   * `Andi & Budi`. Single-character tokens are left untouched
   * (avoids mangling initials).
   */
  private decodeSlugToName(slug:string):string {
    if (!slug) return 'Tamu Undangan';
    const withAmpersand = slug.replace(/\+/g, ' & ').replace(/-/g, ' ');
    return withAmpersand
      .split(' ')
      .map((word) => (word.length === 1 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join(' ')
      .trim();
  }

}
