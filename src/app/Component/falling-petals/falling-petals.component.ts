import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

interface Petal {
  /** Horizontal start position, % of the layer width. */
  left: number;
  /** Animation start delay, seconds. */
  delay: number;
  /** Fall duration, seconds. */
  duration: number;
  /** Rendered size, px. */
  size: number;
  /** Initial rotation, deg (applied via --spin so each petal differs). */
  spin: number;
  /** Horizontal waft amplitude, px (drives the sway keyframe). */
  sway: number;
  /** Sway duration, seconds (independent of fall for organic motion). */
  swayDur: number;
  /** Per-petal opacity for depth (front petals brighter than back). */
  opacity: number;
}

/**
 * Ambient rose petals drifting down a section — "wonderful roses"
 * motif shared with the rest of the 'Till There Was You theme.
 *
 * Plugs into the ambient system via AmbientLiveDirective: the fall +
 * sway loops only run while the host is on screen (the page-wide
 * `fixed` layer is always visible, so its petals never stop; a Hero
 * instance pauses once scrolled away).
 */
@Component({
  selector: 'app-falling-petals',
  standalone: true,
  hostDirectives: [AmbientLiveDirective],
  templateUrl: './falling-petals.component.html',
  styleUrls: ['./falling-petals.component.scss'],
})
export class FallingPetalsComponent implements OnInit, OnChanges {

  @Input('count') count: number = 12;

  petals: Petal[] = [];

  ngOnInit(): void {
    this.buildPetals();
  }

  ngOnChanges(): void {
    this.buildPetals();
  }

  private buildPetals(): void {
    this.petals = Array.from({ length: this.count }, () => {
      const size = 12 + Math.random() * 14;
      return {
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 8,
        size,
        spin: Math.random() * 360,
        sway: 14 + Math.random() * 26,
        swayDur: 3 + Math.random() * 3,   // ~62 BPM neighbourhood, staggered
        // Smaller petals read as "further away" -> fainter, for depth.
        opacity: 0.35 + (size - 12) / 14 * 0.4,
      };
    });
  }

}
