import { Component, Input } from '@angular/core';
import { ParentPermissions, Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-workplace-info-panel',
  templateUrl: './workplace-info-panel.component.html',
})
export class WorkplaceInfoPanelComponent {
  @Input() public workplace: Workplace;

  get canAccessWorkplace() {
    return (
      this.workplace.dataOwner === WorkplaceDataOwner.Parent ||
      this.workplace.dataOwner === WorkplaceDataOwner.Workplace ||
      this.workplace.parentPermissions === ParentPermissions.Workplace ||
      this.workplace.parentPermissions === ParentPermissions.WorkplaceAndStaff
    );
  }

  get canAccessWorkplaceAndStaffRecords() {
    return (
      this.workplace.dataOwner === WorkplaceDataOwner.Parent ||
      this.workplace.parentPermissions === ParentPermissions.WorkplaceAndStaff
    );
  }
}
