import { Pipe, PipeTransform } from '@angular/core';
import { isNull } from 'lodash';

/**
 * This pipe transforms an unknown state of an 'open-ended' question
 * e.g: q: Do you know xxxx ? a: No
 */
@Pipe({
  name: 'openEndedAnswer',
})
export class OpenEndedAnswerPipe implements PipeTransform {
  transform(value: string): any {
    return !isNull(value) ? (value === 'No' ? 'Not known' : value) : '-';
  }
}
