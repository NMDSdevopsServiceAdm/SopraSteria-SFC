import { Component, Input } from '@angular/core';
import { MyWorkplace, ParentPermissions } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-workplace, [app-workplace]',
  templateUrl: './workplace.component.html',
})
export class WorkplaceComponent {
  @Input() public myWorkplace: MyWorkplace;
  public workplacePermission: ParentPermissions = ParentPermissions.Workplace;
  public workplaceAndStaffPermission: ParentPermissions = ParentPermissions.WorkplaceAndStaff;
}
