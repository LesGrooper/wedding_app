import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientNotesComponent } from '../ambient-notes/ambient-notes.component';
import { TransliterationService } from '../../Services/transliteration.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective, AmbientNotesComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements AfterViewInit, OnDestroy {

  /**
   * Prewedding photo list. Files are expected to live under
   * `assets/images/gallery/`. Lazy-loaded by the template.
   */
  images:string[] = [
    'assets/images/gallery/1.jpg',
    'assets/images/gallery/2.jpg',
    'assets/images/gallery/3.jpg',
    'assets/images/gallery/4.jpg',
    'assets/images/gallery/5.jpg',
    'assets/images/gallery/6.jpg',
    'assets/images/gallery/7.jpeg',
    'assets/images/gallery/8.jpg',
    'assets/images/gallery/9.jpg',
    'assets/images/gallery/10.jpg',
    'assets/images/gallery/11.jpg',
    'assets/images/gallery/12.jpg',
    'assets/images/gallery/13.jpg',
    'assets/images/gallery/14.jpg',
    'assets/images/gallery/15.jpg',
  ];

  /** Autoplay interval — the reel advances one photo per tick. */
  private static readonly AUTOPLAY_MS = 5000;

  /**
   * Index of the photo open in the lightbox. `null` = lightbox closed.
   * An index (not a src) so the lightbox arrows can step through photos.
   */
  lightboxIndex = signal<number | null>(null);

  /** Source of the lightbox photo, derived from `lightboxIndex`. */
  lightboxSrc = computed(() => {
    const i = this.lightboxIndex();
    return i === null ? null : this.images[i];
  });

  /** Horizontal reel scroll container, used to read/drive scroll position. */
  @ViewChild('reel') reel?:ElementRef<HTMLDivElement>;

  /** Index of the photo currently snapped/centered — drives the dots. */
  activeIndex = signal(0);

  /** Ensures at most one scroll handler runs per animation frame. */
  private rafScheduled:boolean = false;

  private platformId = inject(PLATFORM_ID);

  /** False on the server and for prefers-reduced-motion users. */
  private autoplayEnabled:boolean = false;

  private autoplayTimer?:ReturnType<typeof setInterval>;

  /** Pauses autoplay while the reel is mostly off-screen. */
  private observer?:IntersectionObserver;

  /**
   * Autoplay hold reasons. Separate flags rather than one counter:
   * enter/leave style events don't always arrive in pairs on touch devices.
   */
  private inView:boolean = false;
  private hovering:boolean = false;
  private touching:boolean = false;
  private keyboardFocus:boolean = false;

  /** Start X of a swipe on the lightbox photo. */
  private swipeStartX:number | null = null;

  constructor(public ts:TransliterationService) { }

  ngAfterViewInit():void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Auto-moving content is exactly what reduced-motion users opt out of;
    // arrows, dots and swipe still work.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = this.reel?.nativeElement;
    if (!el) return;
    this.autoplayEnabled = true;
    if (typeof IntersectionObserver === 'undefined') {
      this.inView = true;
    } else {
      this.observer = new IntersectionObserver(
        ([entry]) => this.inView = entry.isIntersecting,
        { threshold: 0.5 }
      );
      this.observer.observe(el);
    }
    this.restartAutoplay();
  }

  ngOnDestroy():void {
    clearInterval(this.autoplayTimer);
    this.observer?.disconnect();
  }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  open(index:number):void {
    this.lightboxIndex.set(index);
  }

  /** Closes the lightbox and leaves the reel on the photo last viewed. */
  close():void {
    const i = this.lightboxIndex();
    this.lightboxIndex.set(null);
    if (i !== null && i !== this.activeIndex()) this.goTo(i);
    else this.restartAutoplay();
  }

  /** Steps the lightbox photo, wrapping at both ends. */
  step(delta:number):void {
    const i = this.lightboxIndex();
    if (i === null) return;
    this.lightboxIndex.set(this.wrap(i + delta));
  }

  /** Steps the reel one photo, wrapping at both ends. */
  slide(delta:number):void {
    this.goTo(this.wrap(this.activeIndex() + delta));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e:KeyboardEvent):void {
    if (this.lightboxIndex() === null) return;
    if (e.key === 'ArrowLeft') this.step(-1);
    else if (e.key === 'ArrowRight') this.step(1);
    else if (e.key === 'Escape') this.close();
  }

  /** Swipe on the lightbox photo: horizontal drag past 40px steps it. */
  onSwipeStart(e:PointerEvent):void {
    this.swipeStartX = e.clientX;
  }

  onSwipeEnd(e:PointerEvent):void {
    if (this.swipeStartX === null) return;
    const dx = e.clientX - this.swipeStartX;
    this.swipeStartX = null;
    if (Math.abs(dx) > 40) this.step(dx < 0 ? 1 : -1);
  }

  /** The browser took the gesture over (pinch-zoom, vertical pan). */
  cancelSwipe():void {
    this.swipeStartX = null;
  }

  onPointerEnter(e:PointerEvent):void {
    if (e.pointerType === 'mouse') this.hovering = true;
  }

  onPointerLeave(e:PointerEvent):void {
    if (e.pointerType === 'mouse') this.hovering = false;
  }

  onPointerDown(e:PointerEvent):void {
    if (e.pointerType !== 'mouse') this.touching = true;
  }

  /** Also fires as pointercancel when a native swipe takes over. */
  onPointerUp():void {
    if (!this.touching) return;
    this.touching = false;
    this.restartAutoplay();
  }

  /** Only keyboard focus holds autoplay — a mouse click focuses buttons too. */
  onFocusIn(e:FocusEvent):void {
    this.keyboardFocus = (e.target as HTMLElement).matches(':focus-visible');
  }

  onFocusOut():void {
    this.keyboardFocus = false;
  }

  /**
   * Restarts the autoplay countdown, so a manual move never gets followed
   * by an automatic one a moment later. No-op when autoplay is disabled.
   */
  private restartAutoplay():void {
    if (!this.autoplayEnabled) return;
    clearInterval(this.autoplayTimer);
    this.autoplayTimer = setInterval(() => {
      const held = !this.inView || this.hovering || this.touching || this.keyboardFocus
        || this.lightboxIndex() !== null || document.hidden;
      if (!held) this.slide(1);
    }, GalleryComponent.AUTOPLAY_MS);
  }

  private wrap(i:number):number {
    const n = this.images.length;
    return (i % n + n) % n;
  }

  /**
   * Distance between two consecutive cards (card width + gap), read from
   * the live layout so it stays correct across breakpoints/resizes.
   * Returns 0 if the reel isn't ready or has <2 cards.
   */
  private cardStride():number {
    const el = this.reel?.nativeElement;
    if (!el || el.children.length < 2) return 0;
    const first = el.children[0] as HTMLElement;
    const second = el.children[1] as HTMLElement;
    return second.offsetLeft - first.offsetLeft;
  }

  /**
   * Track which card is centered as the user swipes. Throttled to one
   * update per frame (same rAF pattern as ParallaxBgComponent).
   */
  onScroll():void {
    if (this.rafScheduled) return;
    this.rafScheduled = true;
    requestAnimationFrame(() => {
      const el = this.reel?.nativeElement;
      const stride = this.cardStride();
      if (el && stride > 0) {
        const i = Math.round(el.scrollLeft / stride);
        this.activeIndex.set(Math.max(0, Math.min(this.images.length - 1, i)));
      }
      this.rafScheduled = false;
    });
  }

  /** Jump to a photo (dots, arrows, autoplay) and restart the countdown. */
  goTo(index:number):void {
    const el = this.reel?.nativeElement;
    const stride = this.cardStride();
    if (!el || stride <= 0) return;
    el.scrollTo({ left: index * stride, behavior: 'smooth' });
    this.restartAutoplay();
  }

}
