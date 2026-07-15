import { Component, OnInit } from '@angular/core';
import { AmbientLiveDirective } from '../../Directives/ambient-live.directive';

interface Dew {
  left: number;
  top: number;
  size: number;
  delay: number;
}

/**
 * Ambient "meadows of dawn and dew" (Hero) — tema 'Till There Was You.
 * Berkas cahaya fajar yang berdenyut pelan + kerlip embun emas.
 * Murni dekoratif: pointer-events none, aria-hidden, transform/opacity saja.
 */
@Component({
  selector: 'app-ambient-dawn',
  standalone: true,
  hostDirectives: [AmbientLiveDirective],
  templateUrl: './ambient-dawn.component.html',
  styleUrls: ['./ambient-dawn.component.scss'],
})
export class AmbientDawnComponent implements OnInit {

  dews:Dew[] = [];

  ngOnInit():void {
    // Embun tersebar di ~60% bagian atas section, ukuran & fase acak.
    this.dews = Array.from({ length: 6 }, () => ({
      left: 6 + Math.random() * 88,
      top: 6 + Math.random() * 54,
      size: 8 + Math.random() * 8,
      delay: Math.random() * 5.8,
    }));
  }

}
