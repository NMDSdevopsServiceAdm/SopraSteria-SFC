import { Pipe, PipeTransform } from '@angular/core';
import { FormatUtil } from '@core/utils/format-util';

@Pipe({
    name: 'formatPercent',
    standalone: false
})
export class FormatPercentPipe implements PipeTransform {
  transform(data: string) {
    return FormatUtil.formatPercent(data);
  }
}
