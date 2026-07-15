import { Component, Input } from '@angular/core';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

/**
 * Ambient "birds in the sky" — tema 'Till There Was You.
 * mode 'fly'   (Story): sepasang burung line-art menyeberangi section.
 * mode 'perch' (Footer): sepasang burung hinggap berdampingan, bob halus.
 */
@Component({
  selector: 'app-ambient-birds',
  standalone: true,
  hostDirectives: [AmbientLiveDirective],
  templateUrl: './ambient-birds.component.html',
  styleUrls: ['./ambient-birds.component.scss'],
})
export class AmbientBirdsComponent {

  @Input("mode") mode:'fly' | 'perch' = 'fly';

}
