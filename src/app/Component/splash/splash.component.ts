import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../Services/guest.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent {

  /**
   * Fires once the curtain choreography has finished. The host page uses
   * this to unmount the overlay and restore body scrolling.
   */
  @Output() opened:EventEmitter<void> = new EventEmitter<void>();

  /**
   * Fires synchronously the instant the user taps "Buka Undangan" — while
   * still inside the click gesture. The host starts the background music
   * here so it satisfies the browser autoplay policy (a play() call buried
   * inside the later setTimeout would be blocked).
   */
  @Output() started:EventEmitter<void> = new EventEmitter<void>();

  /**
   * Curtains sweep fully open. Choreography mirrors the approved prototype
   * (splash-curtain-preview.html at repo root): greeting fades, curtains
   * crack open ~20% and pause so the couple's photos are seen "pulling"
   * them, then sweep offscreen revealing the invitation page underneath.
   */
  opening:boolean = false;

  /** True near the end: fades the whole splash out before it unmounts. */
  leaving:boolean = false;

  /** When the visitor prefers reduced motion we skip the choreography. */
  reducedMotion:boolean = false;

  constructor(
    public guestService:GuestService,
  ) {
    // Respect prefers-reduced-motion, but allow forcing the animation with
    // "?motion" in the URL — the dev machine has Windows "Show animations"
    // OFF, which would otherwise always skip the show (see memory:
    // reduced-motion-gotcha). Guests with reduced motion still get the skip.
    const prefersReduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forceMotion =
      typeof location !== 'undefined' && /[?&]motion\b/.test(location.search);

    this.reducedMotion = prefersReduce && !forceMotion;

    // "?splash-auto" opens the curtain without a click — used for headless
    // screenshot verification. Music will be blocked (no gesture) but the
    // host swallows that rejection.
    if (typeof location !== 'undefined' && /[?&]splash-auto\b/.test(location.search)) {
      setTimeout(() => this.open(), 500);
    }
  }

  /**
   * Open the theatre curtains. Timings mirror the prototype's CSS:
   * greeting fades on click, curtains animate 2.25s after a 0.25s delay
   * (plateau at ~20% open around the 1.2s mark), fully offscreen ~2.5s,
   * then the splash unmounts.
   */
  open():void {
    if (this.opening) return;

    // Synchronous, still inside the click gesture -> music autoplay allowed.
    this.started.emit();

    if (this.reducedMotion) {
      this.opening = true;
      this.leaving = true;
      setTimeout(() => this.opened.emit(), 120);
      return;
    }

    this.opening = true;
    // Curtain sweep ends at ~2.5s; fade whatever remains, then unmount.
    setTimeout(() => (this.leaving = true), 2550);
    setTimeout(() => this.opened.emit(), 3050);
  }

  /**
   * The arch frames try to load the real photos from
   * public/assets/splash/splash-photo-{left,right}.jpg. Until those files
   * exist this hides the broken <img> so the placeholder shows through.
   */
  hidePhoto(event:Event):void {
    (event.target as HTMLElement).style.display = 'none';
  }

}
