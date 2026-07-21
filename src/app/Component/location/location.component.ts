import { Component, Input } from '@angular/core';
import { SafeUrlPipe } from '../../Pipes/safe-url.pipe';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientHillBellsComponent } from '../ambient-hill-bells/ambient-hill-bells.component';
import { TransliterationService } from '../../Services/transliteration.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [SafeUrlPipe, RevealOnScrollDirective, AmbientHillBellsComponent],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent {

  @Input("name") name:string = '';
  @Input("address") address:string = '';
  @Input("embedUrl") embedUrl:string = '';
  @Input("openUrl") openUrl:string = '';

  constructor(public ts:TransliterationService) { }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

}
