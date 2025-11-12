import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatAmpersand',
    standalone: false
})
export class FormatAmpersandPipe implements PipeTransform {
  transform(value: string) {
    return value.replace(/&/g, 'and');
  }
}
