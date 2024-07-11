import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datesDiff',
})
export class DatesDiffPipe implements PipeTransform {
  transform(date1: Date, date2: Date): string {
    const date =
      date1.toDateString() === date2.toDateString()
        ? date1.toLocaleString('default', { day: '2-digit' }) + ' ' + date1.toLocaleString('default', { month: 'short' })
        : date1.toLocaleString('default', { day: '2-digit' }) +
          ' ' +
          date1.toLocaleString('default', { month: 'short' }) +
          ' - ' +
          date2.toLocaleString('default', { day: '2-digit' }) +
          ' ' +
          date2.toLocaleString('default', { month: 'short' });

    return date;
  }
}
