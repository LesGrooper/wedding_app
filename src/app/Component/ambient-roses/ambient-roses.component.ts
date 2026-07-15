import { Component } from '@angular/core';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

/**
 * Ambient "till there was you" (Mempelai) — sepasang mawar yang mekar
 * (one-shot saat section terlihat) lalu bergoyang sangat pelan.
 * Gaya bunga mengikuti flowers.svg splash: lingkaran petal berlapis.
 */
@Component({
  selector: 'app-ambient-roses',
  standalone: true,
  hostDirectives: [AmbientLiveDirective],
  templateUrl: './ambient-roses.component.html',
  styleUrls: ['./ambient-roses.component.scss'],
})
export class AmbientRosesComponent { }
