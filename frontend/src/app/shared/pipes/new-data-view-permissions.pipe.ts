import { Pipe, PipeTransform } from '@angular/core';
import { DataPermissions } from '@core/model/my-workplaces.model';

@Pipe({
  name: 'newDataViewPermissions',
})
export class NewDataViewPermissionsPipe implements PipeTransform {
  transform(value: DataPermissions): string {
    switch (value) {
      case DataPermissions.Workplace:
        return 'Only your workplace details';
      case DataPermissions.WorkplaceAndStaff:
        return 'Your workplace details and your staff records';
      case DataPermissions.None:
        return 'No access to your data, linked only';
    }
    return null;
  }
}
