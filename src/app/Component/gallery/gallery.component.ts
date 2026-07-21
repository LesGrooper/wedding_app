import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class GalleryComponent {

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
  ];

  /**
   * Currently zoomed image (lightbox source). `null` = lightbox closed.
   */
  active = signal<string | null>(null);

  /** Horizontal reel scroll container, used to read/drive scroll position. */
  @ViewChild('reel') reel?:ElementRef<HTMLDivElement>;

  /** Index of the photo currently snapped/centered — drives the dots. */
  activeIndex = signal(0);

  /** Ensures at most one scroll handler runs per animation frame. */
  private rafScheduled:boolean = false;

  constructor(public ts:TransliterationService) { }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  open(src:string):void {
    this.active.set(src);
  }

  close():void {
    this.active.set(null);
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

  /** Jump to a photo when its dot is tapped. */
  goTo(index:number):void {
    const el = this.reel?.nativeElement;
    const stride = this.cardStride();
    if (!el || stride <= 0) return;
    el.scrollTo({ left: index * stride, behavior: 'smooth' });
  }

}
