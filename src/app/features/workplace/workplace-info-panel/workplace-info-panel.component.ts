import { Component, Input } from '@angular/core';
import { DataPermissions, Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';

@Component({
  selector: 'app-workplace-info-panel',
  templateUrl: './workplace-info-panel.component.html',
})
export class WorkplaceInfoPanelComponent {
  @Input() public workplace: Workplace;
  public dataOwner = WorkplaceDataOwner;

  public get canAccessWorkplace() {
    return (
      this.workplace.dataOwner === WorkplaceDataOwner.Parent ||
      (this.workplace.dataOwner === WorkplaceDataOwner.Workplace &&
        (this.workplace.dataPermissions === DataPermissions.Workplace ||
          this.workplace.dataPermissions === DataPermissions.WorkplaceAndStaff))
    );
  }
}
