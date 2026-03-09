import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined, isNull } from 'lodash';

/**
 * This pipe transforms an unknown state of a 'closed-ended' question
 * e.g: q: What is xxxx? a: Don't know
 */
@Pipe({
  name: 'closedEndedAnswer',
  standalone: false,
})
export class ClosedEndedAnswerPipe implements PipeTransform {
  transform(value: string): any {
    if (isNull(value) || isUndefined(value)) {
      return '-';
    }

    if (["Don't know", 'I do not know'].includes(value)) {
      return 'Not known';
    }

    return value;
  }
}
