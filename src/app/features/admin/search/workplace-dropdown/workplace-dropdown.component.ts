import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EstablishmentSearchItem } from '@core/model/establishment.model';
import { DialogService } from '@core/services/dialog.service';
import { AdminUnlockConfirmationDialogComponent } from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';

@Component({
  selector: 'app-workplace-dropdown',
  templateUrl: './workplace-dropdown.component.html',
})
export class WorkplaceDropdownComponent {
  @Input() item;
  @Input() workplaceIndex: number;
  @Output() navigateToWorkplaceClicked: EventEmitter<NavigationFields> = new EventEmitter<NavigationFields>();

  constructor(private dialogService: DialogService) {}

  public displayAddressForGroups(workplace: EstablishmentSearchItem): string {
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

  public navigateToWorkplace(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.navigateToWorkplaceClicked.emit({ id, username, nmdsId });
  }
}

interface NavigationFields {
  id: string;
  username: string;
  nmdsId: string;
}
