import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiService } from '../../Services/api.service';
import { GuestService } from '../../Services/guest.service';
import { ToastService } from '../../Services/toast.service';
import { Greeting } from '../../Models/greeting.model';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientNotesComponent } from '../ambient-notes/ambient-notes.component';
import { TransliterationService } from '../../Services/transliteration.service';

@Component({
  selector: 'app-greetings-wall',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RevealOnScrollDirective, AmbientNotesComponent],
  templateUrl: './greetings-wall.component.html',
  styleUrls: ['./greetings-wall.component.scss'],
})
export class GreetingsWallComponent implements OnInit {

  /**
   * Greetings displayed in the wall. Updated optimistically on submit
   * (new entry prepended) and re-fetched from the API on init.
   */
  greetings = signal<Greeting[]>([]);
  loading = signal(true);
  submitting = signal(false);

  form!:FormGroup<{
    name: FormControl<string>;
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
      message: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]],
    });
  }

  async ngOnInit():Promise<void> {
    this.guestService.currentGuest$.subscribe((g) => {
      if (g?.name && !this.form.controls.name.dirty) {
        this.form.controls.name.setValue(g.name);
      }
    });

    await this.refresh();
  }

  /**
   * Pull the latest greetings from Apps Script.
   * On any error path we clear the list so the empty-state message shows.
   */
  async refresh():Promise<void> {
    this.loading.set(true);
    const res = await this.apiService.getGreetings();
    this.loading.set(false);
    if (res.ok && Array.isArray(res.data)) {
      this.greetings.set(res.data);
    } else {
      this.greetings.set([]);
    }
  }

  async submit():Promise<void> {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);

    const v = this.form.getRawValue();
    const slug = this.guestService.getSlug();
    const res = await this.apiService.submitGreeting({ slug, name: v.name, message: v.message });
    this.submitting.set(false);

    if (res.ok) {
      // Optimistic prepend so the user sees their entry immediately.
      this.greetings.update((list) => [
        { timestamp: new Date().toISOString(), name: v.name, message: v.message, slug, approved: true },
        ...list,
      ]);
      this.form.controls.message.setValue('');
      this.toastService.toastSuccess(this.ts.trans('greetings_toast_ok'));
    } else if (res.error === 'rate_limited') {
      this.toastService.toastWarning(this.ts.trans('greetings_toast_rate'));
    } else {
      this.toastService.toastDanger(this.errorMessage(res.error));
    }
  }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  /**
   * Compact relative-time formatter (mengikuti bahasa aktif),
   * mis. "5m lalu" / "5m ago".
   */
  formatRelative(iso:string):string {
    if (!iso) return '';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return this.ts.trans('greetings_just_now');
    if (min < 60) return this.ts.trans('greetings_min_ago', String(min));
    const h = Math.floor(min / 60);
    if (h < 24) return this.ts.trans('greetings_hour_ago', String(h));
    const d = Math.floor(h / 24);
    return this.ts.trans('greetings_day_ago', String(d));
  }

  private errorMessage(code?:string):string {
    if (code === 'network') return this.ts.trans('greetings_err_network');
    if (code === 'timeout') return this.ts.trans('greetings_err_timeout');
    return this.ts.trans('greetings_err_generic');
  }

}
