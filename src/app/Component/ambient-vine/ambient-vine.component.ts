import { Component } from '@angular/core';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

/**
 * Ambient "wonderful roses" (RSVP) — sulur mawar yang "tumbuh"
 * mengelilingi form (stroke-dashoffset draw, one-shot saat terlihat),
 * disusul kuncup-kuncup kecil yang mengembang di sudut-sudutnya.
 * Ditempatkan sebagai layer absolut di dalam wrapper `relative`
 * yang membungkus form.
 */
@Component({
  selector: 'app-ambient-vine',
  standalone: true,
  hostDirectives: [AmbientLiveDirective],
  templateUrl: './ambient-vine.component.html',
  styleUrls: ['./ambient-vine.component.scss'],
})
export class AmbientVineComponent { }
