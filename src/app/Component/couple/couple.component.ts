import { Component, Input } from '@angular/core';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientRosesComponent } from '../ambient-roses/ambient-roses.component';
import { TransliterationService } from '../../Services/transliteration.service';

/**
 * Person card payload (groom / bride). Nama ortu (father/mother) dari .env;
 * frasa "Putra dari …" dirangkai di service (dwibahasa).
 */
interface Person {
  name: string;
  father: string;
  mother: string;
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

  constructor(public ts:TransliterationService) { }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

}
