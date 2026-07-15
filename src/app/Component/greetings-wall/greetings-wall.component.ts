import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiService } from '../../Services/api.service';
import { GuestService } from '../../Services/guest.service';
import { ToastService } from '../../Services/toast.service';
import { Greeting } from '../../Models/greeting.model';
import { RevealOnScrollDirective } from '../../Directives/reveal-on-scroll.directive';
import { AmbientNotesComponent } from '../ambient-notes/ambient-notes.component';

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
      this.toastService.toastSuccess('Ucapan terkirim. Terima kasih!');
    } else if (res.error === 'rate_limited') {
      this.toastService.toastWarning('Terlalu banyak kiriman, coba beberapa saat lagi.');
    } else {
      this.toastService.toastDanger(this.errorMessage(res.error));
    }
  }

  /**
   * Compact relative-time formatter (e.g. "5m lalu", "2j lalu", "3h lalu").
   */
  formatRelative(ts:string):string {
    if (!ts) return '';
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'baru saja';
    if (min < 60) return `${min}m lalu`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}j lalu`;
    const d = Math.floor(h / 24);
    return `${d}h lalu`;
  }

  private errorMessage(code?:string):string {
    if (code === 'network') return 'Koneksi terputus, silakan coba lagi.';
    if (code === 'timeout') return 'Server lambat merespons, coba lagi.';
    return 'Gagal mengirim ucapan.';
  }

}
