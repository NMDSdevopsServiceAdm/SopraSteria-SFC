import { Pipe, PipeTransform } from '@angular/core';
import { isNull } from 'lodash';

@Pipe({
    name: 'hasValue',
    standalone: false
})
export class HasValuePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any): boolean {
    if (isNull(value) || value === undefined) {
      return false;
    }

    return true;
  }
}
