import { Pipe, PipeTransform } from '@angular/core';
import { WORKPLACE_SUMMARY_ROUTE } from '@core/constants/constants';

@Pipe({
  name: 'workplaceSummaryPath',
})
export class WorkplaceSummaryPathPipe implements PipeTransform {
  transform(pathSegment: string, workplaceUid: string): Array<String> {
    return ['/workplace', workplaceUid, ...WORKPLACE_SUMMARY_ROUTE, pathSegment];
  }
}
