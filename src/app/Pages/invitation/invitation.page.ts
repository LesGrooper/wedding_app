import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { environment } from '../../../environments/environment';
import { GuestService } from '../../Services/guest.service';
import { TransliterationService } from '../../Services/transliteration.service';

import { SplashComponent } from '../../Component/splash/splash.component';
import { FallingPetalsComponent } from '../../Component/falling-petals/falling-petals.component';
import { HeroComponent } from '../../Component/hero/hero.component';
import { CoupleComponent } from '../../Component/couple/couple.component';
import { CountdownComponent } from '../../Component/countdown/countdown.component';
import { StoryComponent } from '../../Component/story/story.component';
import { GalleryComponent } from '../../Component/gallery/gallery.component';
import { LocationComponent } from '../../Component/location/location.component';
import { RsvpFormComponent } from '../../Component/rsvp-form/rsvp-form.component';
import { GiftComponent } from '../../Component/gift/gift.component';
import { GreetingsWallComponent } from '../../Component/greetings-wall/greetings-wall.component';
import { ParallaxBgComponent } from '../../Component/parallax-bg/parallax-bg.component';
import { AmbientBirdsComponent } from '../../Component/ambient-birds/ambient-birds.component';
import { FormatDatePipe } from '../../Pipes/format-date.pipe';

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [
    CommonModule,
    SplashComponent,
    FallingPetalsComponent,
    HeroComponent,
    CoupleComponent,
    CountdownComponent,
    StoryComponent,
    GalleryComponent,
    LocationComponent,
    RsvpFormComponent,
    GiftComponent,
    GreetingsWallComponent,
    ParallaxBgComponent,
    AmbientBirdsComponent,
    FormatDatePipe,
  ],
  templateUrl: './invitation.page.html',
  styleUrls: ['./invitation.page.scss'],
})
export class InvitationPage {

  /**
   * Static config (couple names, dates, venue) sourced from environment.
   * Bound directly in the template via `env.*`.
   */
  env = environment;

  /**
   * `true` while the splash overlay is active. The splash is rendered
   * conditionally; flipping this to `false` unmounts the overlay and
   * also re-enables body scrolling (see onOpen()).
   */
  splashOpen = signal(true);

  /**
   * Background-music mute state. Drives the floating toggle button's icon
   * and the underlying `<audio>` element's `muted` property. Starts unmuted
   * so the song plays the moment the splash is dismissed.
   */
  muted = signal(false);

  /**
   * Reference to the background-music `<audio>` element declared in the
   * template. Resolved after view init; used to start/mute playback.
   */
  @ViewChild('bgm') bgm!:ElementRef<HTMLAudioElement>;

  constructor(
    public guestService:GuestService,
    public ts:TransliterationService,
  ) {
    // Lock background scrolling while the splash is on top of the page.
    // Restored in onOpen() when the user dismisses the splash.
    document.body.classList.add('no-scroll');
  }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  /**
   * Fired by the splash the instant "Buka Undangan" is tapped — still inside
   * the click gesture, so this play() satisfies the browser autoplay policy.
   * (Starting it later, in onOpen()'s timeout, would risk being blocked.)
   * `.catch()` swallows the rejection when the asset is missing.
   */
  startMusic():void {
    this.bgm?.nativeElement.play().catch(() => {});
  }

  /**
   * Fired once the splash curtain choreography finishes. Unmount the overlay
   * and restore scrolling — the music is already playing from startMusic().
   */
  onOpen():void {
    this.splashOpen.set(false);
    document.body.classList.remove('no-scroll');
  }

  /**
   * Panel foto prewedding (desktop) mencoba memuat
   * public/assets/panel-prewedding.jpg. Selama file-nya belum ada,
   * sembunyikan <img> yang gagal supaya placeholder terlihat.
   */
  hidePanelPhoto(event:Event):void {
    (event.target as HTMLElement).style.display = 'none';
  }

  /**
   * Toggle the background music. Mirrors the `muted` signal onto the audio
   * element and pauses/resumes so the song doesn't keep advancing while muted.
   */
  toggleMute():void {
    const audio = this.bgm?.nativeElement;
    if (!audio) return;

    const next = !this.muted();
    this.muted.set(next);
    audio.muted = next;
    if (next) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

}
