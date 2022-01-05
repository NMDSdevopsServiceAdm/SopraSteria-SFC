import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longDate',
})
export class LongDatePipe extends DatePipe implements PipeTransform {
  transform(value: any, format?: string, timezone?: string, locale?: string): any {
    return super.transform(value, 'd MMMM y , h:mma').replace(',', 'at').replace('AM', 'am').replace('PM', 'pm');
  }
}
