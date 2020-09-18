import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getFirstError' })
export class FirstErrorPipe implements PipeTransform {
  transform(errors: any, error?: any): boolean {
    if (!errors) {
      return false;
    }

    const names = Object.keys(errors);
    if (names && names.length > 0) {
      return errors[names[0]] === error;
    }

    return false;
  }
}
