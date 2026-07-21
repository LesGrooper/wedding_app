import { Component } from '@angular/core';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientBirdsComponent } from '../ambient-birds/ambient-birds.component';
import { TransliterationService } from '../../Services/transliteration.service';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [RevealOnScrollDirective, AmbientBirdsComponent],
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
})
export class StoryComponent {

  /**
   * Bab cerita cinta kini dwibahasa di transliteration.service.ts;
   * template membacanya lewat ts.stories() sesuai bahasa aktif.
   */
  constructor(public ts:TransliterationService) { }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

}
