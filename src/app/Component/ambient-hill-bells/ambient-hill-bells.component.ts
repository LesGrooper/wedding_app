import { Component } from '@angular/core';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

/**
 * Ambient "bells on the hill" (Lokasi) — siluet bukit samar di kaki
 * section + sepasang lonceng emas kecil berayun: lonceng pernikahan
 * berdentang di bukit tempat acara.
 */
@Component({
  selector: 'app-ambient-hill-bells',
  standalone: true,
  hostDirectives: [AmbientLiveDirective],
  templateUrl: './ambient-hill-bells.component.html',
  styleUrls: ['./ambient-hill-bells.component.scss'],
})
export class AmbientHillBellsComponent { }
