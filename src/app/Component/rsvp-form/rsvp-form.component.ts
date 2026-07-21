import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiService } from '../../Services/api.service';
import { GuestService } from '../../Services/guest.service';
import { ToastService } from '../../Services/toast.service';
import { GetStorage, SetStorage, RSVP_FLAG } from '../../Services/storage.service';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientVineComponent } from '../ambient-vine/ambient-vine.component';
import { RsvpPayload, RsvpStatus } from '../../Models/rsvp.model';
import { TransliterationService } from '../../Services/transliteration.service';

@Component({
  selector: 'app-rsvp-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RevealOnScrollDirective, AmbientVineComponent],
  templateUrl: './rsvp-form.component.html',
  styleUrls: ['./rsvp-form.component.scss'],
})
export class RsvpFormComponent implements OnInit {

  /**
   * Radio options for attendance status, rendered as pill buttons.
   */
  statusOptions:{ value:RsvpStatus; labelKey:string }[] = [
    { value: 'hadir', labelKey: 'rsvp_opt_attend' },
    // { value: 'tidak', labelKey: 'rsvp_opt_absent' },
    // { value: 'mungkin', labelKey: 'rsvp_opt_maybe' },
  ];

  /**
   * Locks the form once the guest has already confirmed.
   * Hydrated from localStorage on init via RSVP_FLAG(slug).
   */
  alreadySubmitted = signal(false);

  /**
   * Mid-flight indicator while POSTing to Apps Script.
   */
  submitting = signal(false);

  form!:FormGroup<{
    name: FormControl<string>;
    status: FormControl<RsvpStatus>;
    partner_count: FormControl<number>;
    message: FormControl<string>;
  }>;

  constructor(
    private formBuilder:FormBuilder,
    private apiService:ApiService,
    private guestService:GuestService,
    private toastService:ToastService,
    public ts:TransliterationService,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      status: ['' as RsvpStatus, Validators.required],
      partner_count: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1), Validators.max(1)]],
      message: [''],
    });
  }

  ngOnInit():void {
    // Subscribe to the resolved guest (from ?to= query param) so we can
    // pre-fill the name field and check if this guest already submitted.
    this.guestService.currentGuest$.subscribe(async (g) => {
      if (g?.name && !this.form.controls.name.dirty) {
        this.form.controls.name.setValue(g.name);
      }
      const flag = await GetStorage<boolean>(RSVP_FLAG(g?.slug ?? ''));
      this.alreadySubmitted.set(!!flag);
    });
  }

  async submit():Promise<void> {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);

    const slug = this.guestService.getSlug();
    const v = this.form.getRawValue();
    const payload:RsvpPayload = {
      slug,
      name: v.name,
      status: v.status,
      partner_count: v.partner_count,
      message: v.message,
      user_agent: navigator.userAgent,
    };

    const res = await this.apiService.submitRsvp(payload);
    this.submitting.set(false);

    if (res.ok) {
      await SetStorage(RSVP_FLAG(slug), true);
      this.alreadySubmitted.set(true);
      this.toastService.toastSuccess(this.ts.trans('rsvp_toast_ok'));
    } else {
      this.toastService.toastDanger(this.errorMessage(res.error));
    }
  }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  /**
   * Map known API error codes to user-facing strings (mengikuti bahasa aktif).
   * Unknown codes fall back to a generic message.
   */
  private errorMessage(code?:string):string {
    if (code === 'network') return this.ts.trans('rsvp_err_network');
    if (code === 'timeout') return this.ts.trans('rsvp_err_timeout');
    return this.ts.trans('rsvp_err_generic');
  }

}
