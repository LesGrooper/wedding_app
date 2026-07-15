import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ApiResult } from '../Models/api-response.model';
import { Greeting, GreetingPayload } from '../Models/greeting.model';
import { Guest } from '../Models/guest.model';
import { RsvpPayload } from '../Models/rsvp.model';

const REQUEST_TIMEOUT_MS = 15000;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  /**
   * Base URL of the Apps Script Web App `/exec` endpoint.
   * Configured per environment in src/environments/environment*.ts.
   */
  private url:string = environment.appsScriptUrl;

  constructor(
    private http:HttpClient,
  ) { }

  /* ############################################ READ ############################################ */

  /**
   * Fetch the public greetings list (approved=TRUE rows).
   */
  getGreetings():Promise<ApiResult<Greeting[]>> {
    return this.doGet<Greeting[]>('greetings');
  }

  /**
   * Lookup a single guest by slug — used when the Excel-backed
   * Guests sheet is the source of truth for the personalized name.
   */
  getGuest(slug:string):Promise<ApiResult<Guest>> {
    return this.doGet<Guest>('guest', { slug });
  }

  /* ############################################ WRITE ############################################ */

  /**
   * Submit an RSVP entry. POST body is form-urlencoded so the
   * browser does NOT trigger a CORS preflight — Apps Script does
   * not return Access-Control-Allow-Origin on OPTIONS.
   */
  submitRsvp(payload:RsvpPayload):Promise<ApiResult<{ saved:boolean }>> {
    return this.doPost<{ saved:boolean }>('rsvp', { ...payload });
  }

  /**
   * Submit a wall-of-greetings entry. Server-side rate-limit may
   * respond with `{ ok:false, error:'rate_limited' }` — callers
   * should surface that as a friendly toast.
   */
  submitGreeting(payload:GreetingPayload):Promise<ApiResult<{ saved:boolean }>> {
    return this.doPost<{ saved:boolean }>('greeting', { ...payload });
  }

  /* ############################################ INTERNAL ############################################ */

  /**
   * GET wrapper that resolves (never rejects) so callers can branch
   * on `res.ok` without try/catch — mirrors rest-api.service.ts.
   */
  private doGet<T>(action:string, params:Record<string, string> = {}):Promise<ApiResult<T>> {
    return new Promise((resolve) => {
      let httpParams = new HttpParams().set('action', action);
      for (const k of Object.keys(params)) {
        httpParams = httpParams.set(k, String(params[k] ?? ''));
      }

      this.http.get<ApiResult<T>>(this.url, { params: httpParams })
        .pipe(
          timeout(REQUEST_TIMEOUT_MS)
        )
        .subscribe(
          (result) => {
            resolve(this.normalize<T>(result));
          },
          (err) => {
            if (err && err.name === 'HttpErrorResponse') {
              resolve({ ok: false, error: 'network' });
            } else if (err && err.name === 'TimeoutError') {
              resolve({ ok: false, error: 'timeout' });
            } else {
              resolve({ ok: false, error: 'unknown' });
            }
          }
        );
    });
  }

  /**
   * POST wrapper using form-urlencoded body (no CORS preflight).
   * Same resolve-on-error contract as doGet().
   */
  private doPost<T>(action:string, body:Record<string, unknown>):Promise<ApiResult<T>> {
    return new Promise((resolve) => {
      const form = new URLSearchParams();
      form.set('action', action);
      for (const k of Object.keys(body)) {
        const v = body[k];
        form.set(k, v == null ? '' : String(v));
      }

      this.http.post<ApiResult<T>>(this.url, form.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      })
        .pipe(
          timeout(REQUEST_TIMEOUT_MS)
        )
        .subscribe(
          (result) => {
            resolve(this.normalize<T>(result));
          },
          (err) => {
            if (err && err.name === 'HttpErrorResponse') {
              resolve({ ok: false, error: 'network' });
            } else if (err && err.name === 'TimeoutError') {
              resolve({ ok: false, error: 'timeout' });
            } else {
              resolve({ ok: false, error: 'unknown' });
            }
          }
        );
    });
  }

  /**
   * Defensive normalizer for malformed Apps Script responses
   * (e.g. plain HTML error page returned during a deploy).
   */
  private normalize<T>(res:ApiResult<T> | null | undefined):ApiResult<T> {
    if (!res) return { ok: false, error: 'empty_response' };
    if (typeof res !== 'object') return { ok: false, error: 'bad_response' };
    return res;
  }

}
