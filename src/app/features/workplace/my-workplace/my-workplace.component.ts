import { Component, Input } from '@angular/core';
import { Workplace, ParentPermissions } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-my-workplace',
  templateUrl: './my-workplace.component.html',
})
export class MyWorkplaceComponent {
  @Input() public myWorkplace: Workplace;
  public workplacePermission: ParentPermissions = ParentPermissions.Workplace;
  public workplaceAndStaffPermission: ParentPermissions = ParentPermissions.WorkplaceAndStaff;

  public checkPermission() {
    return (
      this.workplacePermission === this.myWorkplace.parentPermissions ||
      this.workplaceAndStaffPermission === this.myWorkplace.parentPermissions
    );
  }
}
