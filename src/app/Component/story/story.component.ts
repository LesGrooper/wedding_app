import { Component, Input } from '@angular/core';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientBirdsComponent } from '../ambient-birds/ambient-birds.component';

/**
 * One chapter on the love-story timeline: a short time label
 * (script) followed by the narrative paragraph.
 */
interface StoryItem {
  label: string;
  text: string;
}

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [RevealOnScrollDirective, AmbientBirdsComponent],
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
})
export class StoryComponent {

  /**
   * Timeline chapters, ordered chronologically. Content lives in
   * environment.ts (`env.story`) and is bound from invitation.page.html.
   */
  @Input("stories") stories:StoryItem[] = [];

  constructor() { }

}
