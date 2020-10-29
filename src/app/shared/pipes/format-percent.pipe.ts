import { Pipe, PipeTransform } from '@angular/core';
import { FormatUtil } from '@core/utils/fomat-util';

@Pipe({
  name: 'formatPercent',
})
export class FormatPercentPipe implements PipeTransform {
  transform(data: string) {
    return FormatUtil.formatPercent(data);
  }
}
