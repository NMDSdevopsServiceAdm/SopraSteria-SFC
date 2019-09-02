import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash';

@Pipe({
  name: 'orderOther',
})
export class OrderOtherPipe implements PipeTransform {
  transform(array: any[]): any[] {
    return orderBy(array, ['other'], ['desc']);
  }
}
