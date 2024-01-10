import { Pipe, PipeTransform } from '@angular/core';
import { WorkplaceDataOwner } from '@core/model/my-workplaces.model';

@Pipe({
  name: 'workplacePermissionsBearer',
})
export class WorkplacePermissionsBearerPipe implements PipeTransform {
  transform(value: WorkplaceDataOwner): any {
    return value === WorkplaceDataOwner.Parent ? WorkplaceDataOwner.Workplace : WorkplaceDataOwner.Parent;
  }
}
