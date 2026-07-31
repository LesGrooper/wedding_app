import { Component, Input } from '@angular/core';
import { MONOGRAM } from './monogram.paths';

type Variant = 'full' | 'compact';

/**
 * Monogram "R & A" — brand mark undangan.
 *
 * Huruf memakai path hasil outline dari monogram.paths.ts (AUTO-GENERATED),
 * bukan <text> dengan font-family, supaya bentuknya identik dengan favicon /
 * icon PWA / OG cover dan tidak menunggu webfont Google Fonts termuat.
 * Ubah bentuknya di scripts/generate-icons.mjs lalu: pnpm run icons
 */
@Component({
  selector: 'app-monogram',
  standalone: true,
  templateUrl: './monogram.component.html',
  styleUrls: ['./monogram.component.scss'],
})
export class MonogramComponent {

  @Input("size") size:number = 96;
  @Input("variant") variant:Variant = 'full';
  @Input("framed") framed:boolean = true;

  readonly m = MONOGRAM;

  constructor() { }

}
