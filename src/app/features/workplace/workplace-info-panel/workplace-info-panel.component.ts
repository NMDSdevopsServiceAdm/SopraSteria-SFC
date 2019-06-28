import { Component, Input } from '@angular/core';
import { Workplace, ParentPermissions } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-workplace-info-panel',
  templateUrl: './workplace-info-panel.component.html',
})
export class WorkplaceInfoPanelComponent {
  @Input() public workplace: Workplace;
  public workplacePermission: ParentPermissions = ParentPermissions.Workplace;
  public workplaceAndStaffPermission: ParentPermissions = ParentPermissions.WorkplaceAndStaff;

  public checkPermission() {
    return (
      this.workplacePermission === this.workplace.parentPermissions ||
      this.workplaceAndStaffPermission === this.workplace.parentPermissions
    );
  }
}
