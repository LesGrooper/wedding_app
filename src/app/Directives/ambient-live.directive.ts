import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  AfterViewInit,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Toggle the `is-live` class while the host element intersects the
 * viewport. Ambient decorations key their `animation-play-state` off
 * this class so loops only run while their section is on screen
 * (battery-friendly on guests' phones) and one-shot animations
 * (rose bloom, vine draw) start exactly when the section is seen.
 *
 * Unlike RevealOnScrollDirective this observer is TWO-WAY: it keeps
 * observing and removes the class when the section scrolls away.
 * One-shot animations use `animation-fill-mode: forwards`, so being
 * paused after they finish has no visual effect.
 *
 * Used as a hostDirective by every `app-ambient-*` component, and can
 * also be applied directly (e.g. the countdown "breathe" grid).
 */
@Directive({
  selector: '[appAmbientLive]',
  standalone: true,
})
export class AmbientLiveDirective implements AfterViewInit, OnDestroy {

  /**
   * Fraction of the host that must be visible before animations run.
   * Kept low so ambient layers wake up as soon as they peek in.
   */
  @Input("ambientThreshold") ambientThreshold:number = 0.05;

  private observer?:IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private el:ElementRef<HTMLElement>,
  ) { }

  ngAfterViewInit():void {
    if (!isPlatformBrowser(this.platformId)) return;

    const node = this.el.nativeElement;

    // No IntersectionObserver (very old browsers): just run forever.
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-live');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          node.classList.toggle('is-live', entry.isIntersecting);
        }
      },
      { threshold: this.ambientThreshold }
    );

    this.observer.observe(node);
  }

  ngOnDestroy():void {
    this.observer?.disconnect();
  }

}
