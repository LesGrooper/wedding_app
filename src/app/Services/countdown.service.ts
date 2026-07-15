import { Injectable } from '@angular/core';
import { Observable, interval, map, startWith } from 'rxjs';

/**
 * Snapshot of the remaining time until a target date.
 * `done = true` once the target instant has passed.
 */
export interface CountdownTick {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

/**
 * Emits a CountdownTick every second until the wedding date.
 * Consumed by the CountdownComponent via the `async` pipe.
 */
@Injectable({
  providedIn: 'root'
})
export class CountdownService {

  constructor() { }

  /**
   * Build a 1-Hz observable that ticks down to `targetIso`.
   * Starts with an immediate emission so the UI never shows blanks.
   */
  countdown$(targetIso:string):Observable<CountdownTick> {
    const target = new Date(targetIso).getTime();
    return interval(1000).pipe(
      startWith(0),
      map(() => this.diff(target))
    );
  }

  /**
   * Compute the days/hours/minutes/seconds remaining until `target`.
   * Negative results are clamped to zero (we only count down, never up).
   */
  private diff(target:number):CountdownTick {
    const now = Date.now();
    const ms = Math.max(0, target - now);
    const days = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);
    return { days, hours, minutes, seconds, done: ms === 0 };
  }

}
