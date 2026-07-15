import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastKind = 'success' | 'warning' | 'danger';

/**
 * Single toast notification rendered by `<app-toast-host>`.
 */
export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

/**
 * Lightweight toast service. API mirrors mobile-frontend's
 * GlobalService.toastSuccess / toastWarning / toastDanger so calling
 * code feels identical, but the renderer is our own host component
 * (no Ionic ToastController dependency).
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  /**
   * Auto-incrementing ID used to identify toasts for dismissal.
   */
  private seq:number = 0;

  /**
   * Backing subject for the currently visible toast stack.
   */
  private toasts$:BehaviorSubject<ToastItem[]> = new BehaviorSubject<ToastItem[]>([]);

  /**
   * Public stream consumed by `<app-toast-host>`.
   */
  readonly stream$:Observable<ToastItem[]> = this.toasts$.asObservable();

  constructor() { }

  toastSuccess(message:string, duration:number = 2500):void {
    this.push('success', message, duration);
  }

  toastWarning(message:string, duration:number = 2800):void {
    this.push('warning', message, duration);
  }

  toastDanger(message:string, duration:number = 3200):void {
    this.push('danger', message, duration);
  }

  /**
   * Remove a single toast by id (used by the click-to-dismiss handler).
   */
  dismiss(id:number):void {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }

  /**
   * Append a toast and schedule its auto-dismissal.
   */
  private push(kind:ToastKind, message:string, duration:number):void {
    const id = ++this.seq;
    this.toasts$.next([...this.toasts$.value, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

}
