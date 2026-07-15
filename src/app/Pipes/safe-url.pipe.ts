import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Bypass Angular's resource-URL sanitization so iframes / embeds
 * (e.g. Google Maps) can be bound dynamically.
 *
 * Example
 * ---
 * ```html
 * <iframe [src]="embedUrl | safeUrl"></iframe>
 * ```
 *
 * Security
 * ---
 * Only use this pipe with URLs that originate from trusted config
 * (the `environment.ts` venue.mapsEmbedUrl), never with user input.
 */
@Pipe({
  name: 'safeUrl',
  standalone: true,
})
export class SafeUrlPipe implements PipeTransform {

  constructor(
    private sanitizer:DomSanitizer,
  ) { }

  transform(value:string | null | undefined):SafeResourceUrl | string {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

}
