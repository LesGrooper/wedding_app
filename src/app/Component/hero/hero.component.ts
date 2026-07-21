import { Component, Input } from '@angular/core';
import { FallingPetalsComponent } from '../falling-petals/falling-petals.component';
import { FloatingFloralComponent } from '../floating-floral/floating-floral.component';
import { AmbientDawnComponent } from '../ambient-dawn/ambient-dawn.component';
import { TransliterationService } from '../../Services/transliteration.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [FallingPetalsComponent, FloatingFloralComponent, AmbientDawnComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {

  @Input("groom") groom:string = '';
  @Input("bride") bride:string = '';
  @Input("formattedDate") formattedDate:string = '';
  @Input("guestName") guestName:string = 'Tamu Undangan';

  constructor(public ts:TransliterationService) { }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

}
