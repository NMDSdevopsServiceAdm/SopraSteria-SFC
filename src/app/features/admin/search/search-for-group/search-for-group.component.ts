import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EstablishmentSearchItem, GroupSearchRequest } from '@core/model/establishment.model';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { AdminUnlockConfirmationDialogComponent } from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-for-group',
  templateUrl: './search-for-group.component.html',
})
export class SearchForGroupComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;
  public results: Array<EstablishmentSearchItem> = [];
  public establishmentDetails = [];
  public establishmentDetailsLabel = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private switchWorkplaceService: SwitchWorkplaceService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      employerType: 'All',
      onlyParents: false,
    });
  }

  public navigateToWorkplace(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public toggleDetails(uid: string, event: Event): void {
    event.preventDefault();
    this.establishmentDetails[uid] = !this.establishmentDetails[uid];
    this.establishmentDetailsLabel[uid] = this.establishmentDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

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
        this.results[workplaceIndex].users[userIndex].isLocked = false;
      },
    };

    this.dialogService.open(AdminUnlockConfirmationDialogComponent, data);
  }

  public onSubmit(): void {
    const data = this.getRequestData();
    this.subscriptions.add(
      this.establishmentService.searchGroups(data).subscribe(
        (response) => {
          this.results = response;
          this.submitted = true;
        },
        (error) => console.error(error),
      ),
    );
  }

  private getRequestData(): GroupSearchRequest {
    return {
      employerType: this.form.controls.employerType.value,
      onlyParents: this.form.controls.onlyParents.value,
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
