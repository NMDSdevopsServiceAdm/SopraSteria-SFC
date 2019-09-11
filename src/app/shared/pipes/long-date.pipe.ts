import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longDate',
})
export class LongDatePipe extends DatePipe implements PipeTransform {
  transform(date: string) {
    return super
      .transform(date, 'MMMM d y, h:mm:ss a')
      .replace(',', ' at')
      .replace('AM', 'am')
      .replace('PM', 'pm');
  }
}
