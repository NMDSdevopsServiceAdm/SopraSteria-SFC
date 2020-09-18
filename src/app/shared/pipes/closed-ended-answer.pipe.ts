import { Pipe, PipeTransform } from '@angular/core';
import { isNull } from 'lodash';

/**
 * This pipe transforms an unknown state of a 'closed-ended' question
 * e.g: q: What is xxxx? a: Don't know
 */
@Pipe({
  name: 'closedEndedAnswer',
})
export class ClosedEndedAnswerPipe implements PipeTransform {
  transform(value: string): any {
    return !isNull(value) ? (value === 'Don\'t know' ? 'Not known' : value) : '-';
  }
}
