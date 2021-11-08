import { Pipe, PipeTransform } from '@angular/core';
import isNumber from 'lodash/isNumber';

@Pipe({
  name: 'numericAnswer',
})
export class NumericAnswerPipe implements PipeTransform {
  transform(value: string) {
    return isNumber(value) ? value : '-';
  }
}
