import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

interface Note {
  left: number;
  size: number;
  delay: number;
  duration: number;
  double: boolean;
  color: string;
}

/**
 * Ambient "and there was music" — not musik kecil melayang naik
 * dengan goyangan halus. Dipakai Gallery (moments bersenandung)
 * dan Ucapan & Doa (ucapan tamu = musiknya).
 */
@Component({
  selector: 'app-ambient-notes',
  standalone: true,
  hostDirectives: [AmbientLiveDirective],
  templateUrl: './ambient-notes.component.html',
  styleUrls: ['./ambient-notes.component.scss'],
})
export class AmbientNotesComponent implements OnInit, OnChanges {

  @Input("count") count:number = 5;

  notes:Note[] = [];

  /** Token tema (src/styles.css) — ikut berganti per ?acara=. */
  private readonly colors:string[] = ['var(--color-rose)', 'var(--color-gold-soft)', 'var(--color-rose-dark)'];

  ngOnInit():void {
    this.buildNotes();
  }

  ngOnChanges():void {
    this.buildNotes();
  }

  private buildNotes():void {
    this.notes = Array.from({ length: this.count }, (_, i) => ({
      left: 6 + Math.random() * 86,
      size: 13 + Math.random() * 8,
      delay: Math.random() * 9,
      duration: 7.8 + Math.random() * 4,       // ~8 ketukan @62 BPM + variasi
      double: i % 3 === 0,                      // sebagian not ganda (♫)
      color: this.colors[i % this.colors.length],
    }));
  }

}
