import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { CountdownService, CountdownTick } from '../../Services/countdown.service';
import { FormatDatePipe } from '../../Pipes/format-date.pipe';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule, FormatDatePipe, RevealOnScrollDirective, AmbientLiveDirective],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {

  @Input("eventDate") eventDate!:string;

  /**
   * Live stream emitted every second with days/hours/minutes/seconds.
   * Assigned in ngOnInit because we depend on the @Input value.
   */
  tick$!:Observable<CountdownTick>;

  constructor(
    private countdownService:CountdownService,
  ) { }

  ngOnInit():void {
    this.tick$ = this.countdownService.countdown$(this.eventDate);
  }

  /**
   * Map a CountdownTick to the 4 grid cells (with Indonesian labels).
   * Falls back to zeroes while the first emission is pending.
   */
  cells(t:CountdownTick | null):{ label:string; value:number }[] {
    const safe = t ?? { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };
    return [
      { label: 'Hari', value: safe.days },
      { label: 'Jam', value: safe.hours },
      { label: 'Menit', value: safe.minutes },
      { label: 'Detik', value: safe.seconds },
    ];
  }

  /**
   * Zero-pad single-digit numbers for the countdown display.
   */
  pad(n:number):string {
    return n < 10 ? `0${n}` : String(n);
  }

}
