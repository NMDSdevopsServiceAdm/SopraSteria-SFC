import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { SummaryList } from '@core/model/summary-list.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cancel-data-owner-dialog',
  templateUrl: './cancel-data-owner-dialog.component.html',
})
export class CancelDataOwnerDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public dataPermissions: DataPermissions[];
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  public workplace: Workplace;
  public dataPermissionsRequester: Establishment;
  public summaryList: SummaryList[];
  protected subscriptions: Subscription = new Subscription();
  public permissionType: string;
  public isCancelOwnershipError: boolean;
  public serverError: string;
  public ownershipToName: string;
  public ownershipFromName: string;
  public isSubWorkplace: boolean;
  public ownershipToUid: string;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private establishmentService: EstablishmentService,
    public dialog: Dialog<CancelDataOwnerDialogComponent>
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.setWorkplaces();
    this.setDataPermissions();
    this.setupSummaryList();
  }

  private setWorkplaces(): void {
    this.workplace = this.data;
    this.dataPermissionsRequester = this.establishmentService.primaryWorkplace;
    this.isSubWorkplace =
      !this.workplace.isParent && this.workplace.uid === this.establishmentService.primaryWorkplace.uid ? true : false;

    if (this.workplace.dataOwner === 'Workplace') {
      this.ownershipToName = this.isSubWorkplace ? this.workplace.parentName : this.dataPermissionsRequester.name;
      this.ownershipToUid = this.isSubWorkplace ? this.workplace.uid : this.dataPermissionsRequester.uid;
      this.ownershipFromName = this.workplace.name;
    } else {
      this.ownershipToName = this.workplace.name;
      this.ownershipToUid = this.workplace.uid;
      this.ownershipFromName = this.isSubWorkplace ? this.workplace.parentName : this.dataPermissionsRequester.name;
    }
  }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  private setupSummaryList(): void {
    this.summaryList = [
      {
        label: 'From',
        data: this.ownershipFromName,
      },
      {
        label: 'To',
        data: this.ownershipToName,
      },
    ];
  }

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }

  public cancelChangeOwnership() {
    let status = {
      approvalStatus: 'CANCELLED',
      notificationRecipientUid: this.ownershipToUid,
    };
    if (this.workplace.ownershipChangeRequestId) {
      this.subscriptions.add(
        this.establishmentService
          .cancelOwnership(this.workplace.uid, this.workplace.ownershipChangeRequestId, status)
          .subscribe(
            data => {
              if (data) {
                this.close(true);
              }
            },
            error => {
              this.isCancelOwnershipError = true;
              if (error.error.message) {
                this.serverError = error.error.message;
              }
            }
          )
      );
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
