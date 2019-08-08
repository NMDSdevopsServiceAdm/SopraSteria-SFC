import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'absoluteNumber',
})
export class AbsoluteNumberPipe implements PipeTransform {
  transform(value: number): number {
    return Math.abs(value);
  }
}
