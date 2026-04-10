import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatMoneyWithDecimals',
    standalone: false
})

export class FormatMoneyWithDecimalsPipe implements PipeTransform {
  transform(value: string): string {
    return "£" + Number(value).toFixed(2);
  }
}
