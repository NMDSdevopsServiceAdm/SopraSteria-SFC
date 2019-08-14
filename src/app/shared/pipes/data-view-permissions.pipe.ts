import { Pipe, PipeTransform } from '@angular/core';
import { DataPermissions } from '@core/model/my-workplaces.model';

@Pipe({
  name: 'dataViewPermissions',
})
export class DataViewPermissionsPipe implements PipeTransform {
  transform(value: DataPermissions): string {
    switch (value) {
      case DataPermissions.Workplace:
        return 'Workplace';
      case DataPermissions.WorkplaceAndStaff:
        return 'Workplace and staff records';
      case DataPermissions.None:
        return 'None, linked only';
    }
    return null;
  }
}
