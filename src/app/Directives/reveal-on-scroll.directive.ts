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
 * Reveal an element when it enters the viewport.
 *
 * The directive adds the `reveal` class immediately and the
 * `is-visible` class once the host element intersects the viewport
 * (threshold configurable per usage). The transition itself is
 * implemented purely in CSS — see styles.css for the `.reveal` rules.
 *
 * Reference: pattern follows mobile-frontend's directives (short-press
 * etc.) — single-purpose, lifecycle-aware, browser-platform guarded.
 *
 * Example
 * ---
 * ```html
 * <div appReveal>fade up on scroll</div>
 * <div appReveal="left" [revealDelay]="150">slide in from left</div>
 * ```
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {

  /**
   * Reveal style. `''` (default) = fade + translate up,
   * `'left'` = slide from left, `'right'` = slide from right.
   */
  @Input("appReveal") appReveal:'' | 'left' | 'right' | 'up' = '';

  /**
   * Delay before the reveal animation starts, in milliseconds.
   * Used to stagger sibling reveals (e.g. gallery grid).
   */
  @Input("revealDelay") revealDelay:number = 0;

  /**
   * IntersectionObserver threshold — fraction of the element that
   * must be visible before the reveal fires.
   */
  @Input("revealThreshold") revealThreshold:number = 0.15;

  /**
   * Cached IntersectionObserver — disconnected on destroy to avoid
   * leaks during route changes.
   */
  private observer?:IntersectionObserver;

  /**
   * Required so this directive can be safely consumed under SSR
   * (no `window` / `IntersectionObserver` on the server).
   */
  private platformId = inject(PLATFORM_ID);

  constructor(
    private el:ElementRef<HTMLElement>,
  ) { }

  ngAfterViewInit():void {
    if (!isPlatformBrowser(this.platformId)) return;

    const node = this.el.nativeElement;
    node.classList.add('reveal');
    if (this.appReveal === 'left') node.classList.add('reveal-left');
    if (this.appReveal === 'right') node.classList.add('reveal-right');
    if (this.revealDelay) node.style.transitionDelay = `${this.revealDelay}ms`;

    // Old browsers without IntersectionObserver: just reveal immediately
    // so content is never stuck hidden.
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            // One-shot reveal: stop observing once visible.
            this.observer?.unobserve(node);
          }
        }
      },
      { threshold: this.revealThreshold }
    );

    this.observer.observe(node);
  }

  ngOnDestroy():void {
    this.observer?.disconnect();
  }

}
