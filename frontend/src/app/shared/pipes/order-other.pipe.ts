import { Pipe, PipeTransform } from '@angular/core';
import orderBy from 'lodash/orderBy';

@Pipe({
    name: 'orderOther',
    standalone: false
})
export class OrderOtherPipe implements PipeTransform {
  transform(array: any[]): any[] {
    return orderBy(array, ['other'], ['desc']);
  }
}
