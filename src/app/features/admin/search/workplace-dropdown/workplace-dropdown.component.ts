import { Component, Input } from '@angular/core';
import { WorkplaceSearchItem } from '@core/model/admin/search.model';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import {
  RemoveParentConfirmationComponent,
} from '@shared/components/remove-parent-confirmation/remove-parent-confirmation.component';

@Component({
  selector: 'app-workplace-dropdown',
  templateUrl: './workplace-dropdown.component.html',
})
export class WorkplaceDropdownComponent {
  @Input() item: WorkplaceSearchItem;
  @Input() workplaceIndex: number;
  @Input() navigateToWorkplace: () => void;
  @Input() unlockUser: (username: string, workplaceIndex: number, user: any) => void;

  constructor(private dialogService: DialogService, private switchWorkplaceService: SwitchWorkplaceService) {}

  public displayAddressForGroups(workplace: WorkplaceSearchItem): string {
    const secondaryAddress =
      ' ' + [workplace.address2, workplace.town, workplace.county, workplace.postcode].filter(Boolean).join(', ') || '';

    return workplace.address1 + secondaryAddress;
  }

  public unlockWorkplaceUser(username: string, workplaceIndex: number, userIndex: number, event: Event): void {
    event.preventDefault();
    this.unlockUser(username, workplaceIndex, this.item.users[userIndex]);
  }

  public removeParent(event: Event): void {
    event.preventDefault();
    const data = {
      establishmentId: this.item.uid,
      establishmentName: this.item.name,
      removeStatus: () => {
        this.item.isParent = false;
      },
    };
    this.dialogService.open(RemoveParentConfirmationComponent, data);
  }
}
