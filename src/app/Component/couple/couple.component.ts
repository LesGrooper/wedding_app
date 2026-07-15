import { Component, Input } from '@angular/core';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientRosesComponent } from '../ambient-roses/ambient-roses.component';

/**
 * Person card payload (groom / bride).
 */
interface Person {
  name: string;
  parents: string;
  photo: string;
}

@Component({
  selector: 'app-couple',
  standalone: true,
  imports: [RevealOnScrollDirective, AmbientRosesComponent],
  templateUrl: './couple.component.html',
  styleUrls: ['./couple.component.scss'],
})
export class CoupleComponent {

  @Input("groom") groom!:Person;
  @Input("bride") bride!:Person;

  constructor() { }

}
