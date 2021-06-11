import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longDate',
})
export class LongDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(date: string): string {
    return this.datePipe.transform(date, 'd MMMM y , h:mma').replace(',', 'at').replace('AM', 'am').replace('PM', 'pm');
  }
}
