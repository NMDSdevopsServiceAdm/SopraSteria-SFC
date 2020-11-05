import { Pipe, PipeTransform } from '@angular/core';
import { FormatUtil } from '@core/utils/format-util';

@Pipe({
  name: 'formatMoney',
})
export class FormatMoneyPipe implements PipeTransform {
  transform(data: string) {
    return FormatUtil.formatMoney(data);
  }
}
