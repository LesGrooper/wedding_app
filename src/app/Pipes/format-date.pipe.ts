import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format a date / ISO string / timestamp using date-fns with the
 * Indonesian locale. Drop-in replacement for the moment-based
 * `formatDatetime` pipe in mobile-frontend, without the legacy
 * moment.js dependency.
 *
 * Example
 * ---
 * ```html
 * <p>{{ eventDate | formatDate: 'EEEE, d MMMM yyyy' }}</p>
 * ```
 *
 * Valid arguments
 * ---
 * - [0]: date-fns format string. Defaults to `EEEE, d MMMM yyyy`
 *        (e.g. "Sabtu, 21 Juni 2026").
 */
@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {

  constructor() { }

  transform(value:string | Date | number | null | undefined, fmt:string = 'EEEE, d MMMM yyyy'):string {
    // Reject null/undefined/empty so the template renders nothing
    // instead of "Invalid Date".
    if (value == null || value === '') return '';
    try {
      // Normalize the input — Date stays as-is, anything else goes
      // through the Date constructor (ISO string or epoch number).
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return '';
      return format(d, fmt, { locale: id });
    } catch {
      // Defensive guard: if date-fns ever throws on an unknown format
      // token, fall back to an empty string instead of breaking render.
      return '';
    }
  }

}
