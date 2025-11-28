import { Pipe, PipeTransform } from '@angular/core';
import { DataPermissions } from '@core/model/my-workplaces.model';

@Pipe({
    name: 'newDataViewPermissions',
    standalone: false
})
export class NewDataViewPermissionsPipe implements PipeTransform {
  transform(value: DataPermissions, isParent: boolean): string {
    if (isParent) {
      switch (value) {
        case DataPermissions.Workplace:
          return 'Only their workplace details';
        case DataPermissions.WorkplaceAndStaff:
          return 'Their workplace details and their staff records';
        case DataPermissions.None:
          return 'No access to their data, linked only';
      }
    } else {
      switch (value) {
        case DataPermissions.Workplace:
          return 'Only your workplace details';
        case DataPermissions.WorkplaceAndStaff:
          return 'Your workplace details and your staff records';
        case DataPermissions.None:
          return 'No access to your data, linked only';
      }
    }
    return null;
  }
}
