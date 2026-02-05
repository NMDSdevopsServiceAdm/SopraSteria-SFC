import { Pipe, PipeTransform } from '@angular/core';
import { ADD_WORKPLACE_DETAILS_ROUTE } from '@core/constants/constants';

@Pipe({
  name: 'addWorkplaceDetailsPath',
})
export class AddWorkplaceDetailsPathPipe implements PipeTransform {
  transform(pathSegment: string, workplaceUid: string): Array<String> {
    return ['/workplace', workplaceUid, ...ADD_WORKPLACE_DETAILS_ROUTE, pathSegment];
  }
}
