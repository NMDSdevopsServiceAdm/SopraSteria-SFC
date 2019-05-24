import { Component, Input } from '@angular/core';
import { MyWorkplace, ParentPermissions } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-my-workplace',
  templateUrl: './my-workplace.component.html',
})
export class MyWorkplaceComponent {
  @Input() public myWorkplace: MyWorkplace;
  public workplacePermission: ParentPermissions = ParentPermissions.Workplace;
  public workplaceAndStaffPermission: ParentPermissions = ParentPermissions.WorkplaceAndStaff;
}
