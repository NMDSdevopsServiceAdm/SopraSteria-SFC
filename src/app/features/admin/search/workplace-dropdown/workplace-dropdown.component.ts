import { Component, Input } from '@angular/core';
import { WorkplaceSearchItem } from '@core/model/admin/search.model';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { AdminUnlockConfirmationDialogComponent } from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';

@Component({
  selector: 'app-workplace-dropdown',
  templateUrl: './workplace-dropdown.component.html',
})
export class WorkplaceDropdownComponent {
  @Input() item: WorkplaceSearchItem;
  @Input() workplaceIndex: number;
  @Input() navigateToWorkplace: () => void;

  constructor(private dialogService: DialogService, private switchWorkplaceService: SwitchWorkplaceService) {}

  public displayAddressForGroups(workplace: WorkplaceSearchItem): string {
    const secondaryAddress =
      ' ' + [workplace.address2, workplace.town, workplace.county, workplace.postcode].filter(Boolean).join(', ') || '';

    return workplace.address1 + secondaryAddress;
  }

  public unlockWorkplaceUser(username: string, workplaceIndex: number, userIndex: number, e: Event): void {
    e.preventDefault();
    const data = {
      username,
      removeUnlock: () => {
        this.item.users[userIndex].isLocked = false;
      },
    };

    this.dialogService.open(AdminUnlockConfirmationDialogComponent, data);
  }
}
