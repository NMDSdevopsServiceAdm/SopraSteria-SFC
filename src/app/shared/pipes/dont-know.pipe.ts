import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dontKnow',
})
export class DontKnowPipe implements PipeTransform {
  transform(value: string): string {
    return value === `Don't know` ? 'I do not know' : value;
  }
}
