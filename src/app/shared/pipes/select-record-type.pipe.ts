import { Pipe, PipeTransform } from '@angular/core';
import { SelectRecordTypes } from '@core/model/worker.model';

@Pipe({
  name: 'SelectRecordTypesName',
})
export class SelectRecordTypePipe implements PipeTransform {
  transform(value: SelectRecordTypes): string {
    switch (value) {
      case SelectRecordTypes.Training:
        return 'Training course';
      case SelectRecordTypes.Qualification:
        return 'Qualification';
    }
    return null;
  }
}
