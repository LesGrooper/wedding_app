import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { CountdownService, CountdownTick } from '../../Services/countdown.service';
import { FormatDatePipe } from '../../Pipes/format-date.pipe';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';
import { TransliterationService } from '../../Services/transliteration.service';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule, FormatDatePipe, RevealOnScrollDirective, AmbientLiveDirective],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {

  @Input("eventDate") eventDate!:string;

  /** Jadwal acara — teks bebas dari .env, ditampilkan apa adanya. */
  @Input("akadTime") akadTime!:string;
  @Input("receptionTime") receptionTime!:string;

  /**
   * Live stream emitted every second with days/hours/minutes/seconds.
   * Assigned in ngOnInit because we depend on the @Input value.
   */
  tick$!:Observable<CountdownTick>;

  constructor(
    private countdownService:CountdownService,
    public ts:TransliterationService,
  ) { }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  ngOnInit():void {
    this.tick$ = this.countdownService.countdown$(this.eventDate);
  }

  /**
   * Map a CountdownTick to the 4 grid cells (label mengikuti bahasa aktif).
   * Falls back to zeroes while the first emission is pending.
   */
  cells(t:CountdownTick | null):{ label:string; value:number }[] {
    const safe = t ?? { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };
    return [
      { label: this.ts.trans('countdown_days'), value: safe.days },
      { label: this.ts.trans('countdown_hours'), value: safe.hours },
      { label: this.ts.trans('countdown_minutes'), value: safe.minutes },
      { label: this.ts.trans('countdown_seconds'), value: safe.seconds },
    ];
  }

  /**
   * Zero-pad single-digit numbers for the countdown display.
   */
  pad(n:number):string {
    return n < 10 ? `0${n}` : String(n);
  }

}
