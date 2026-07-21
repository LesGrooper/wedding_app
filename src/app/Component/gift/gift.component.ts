import { Component, Input } from '@angular/core';

import { ToastService } from '../../Services/toast.service';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { TransliterationService } from '../../Services/transliteration.service';

/**
 * Satu rekening tujuan wedding gift. `name` sudah berisi nama mempelai —
 * di-generate dari GROOM_NAME / BRIDE_NAME oleh scripts/generate-env.mjs.
 */
export interface GiftAccount {
  bank: string;
  number: string;
  name: string;
}

@Component({
  selector: 'app-gift',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.scss'],
})
export class GiftComponent {

  @Input("accounts") accounts:GiftAccount[] = [];

  constructor(
    private toastService:ToastService,
    public ts:TransliterationService,
  ) { }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  /**
   * Salin nomor rekening ke clipboard. Pakai Clipboard API bila tersedia,
   * lalu jatuh ke <textarea> + execCommand untuk browser lama / konteks
   * non-secure. Angka dinormalisasi (spasi dibuang) supaya siap tempel.
   */
  async copy(number:string):Promise<void> {
    const value = (number ?? '').replace(/\s+/g, '');
    if (!value) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        this.fallbackCopy(value);
      }
      this.toastService.toastSuccess(this.ts.trans('gift_toast_copied'));
    } catch {
      try {
        this.fallbackCopy(value);
        this.toastService.toastSuccess(this.ts.trans('gift_toast_copied'));
      } catch {
        this.toastService.toastDanger(this.ts.trans('gift_toast_copy_fail'));
      }
    }
  }

  private fallbackCopy(value:string):void {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (!ok) throw new Error('execCommand copy gagal');
  }

}
