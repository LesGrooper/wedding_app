import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-parallax-bg',
  standalone: true,
  templateUrl: './parallax-bg.component.html',
  styleUrls: ['./parallax-bg.component.scss'],
})
export class ParallaxBgComponent {

  @Input("src") src:string = '';
  @Input("speed") speed:number = 0.3;

  @ViewChild('layer') layerRef?:ElementRef<HTMLDivElement>;
  offset:number = 0;

  private platformId = inject(PLATFORM_ID);
  private rafScheduled:boolean = false;

  constructor() { }

  /**
   * Listen to window scroll and translate the background layer.
   * Use requestAnimationFrame so we never queue more than one update per frame.
   */
  @HostListener('window:scroll')
  onScroll():void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rafScheduled) return;
    this.rafScheduled = true;
    requestAnimationFrame(() => {
      this.offset = -window.scrollY * this.speed;
      this.rafScheduled = false;
    });
  }

}
