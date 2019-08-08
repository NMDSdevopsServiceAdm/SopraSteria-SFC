import { Pipe, PipeTransform } from '@angular/core';
import { WorkerDays } from '@core/model/worker.model';
import { isNumber } from 'lodash';

@Pipe({
  name: 'workerDays',
})
export class WorkerDaysPipe implements PipeTransform {
  transform(workderDays: WorkerDays) {
    if (!workderDays) {
      return null;
    }
    return isNumber(workderDays.days) ? workderDays.days : workderDays.value;
  }
}
