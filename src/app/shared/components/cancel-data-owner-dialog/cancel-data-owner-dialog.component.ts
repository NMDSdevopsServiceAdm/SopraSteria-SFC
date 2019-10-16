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
  public requesterName: string;

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
    if (!this.workplace.isParent && this.workplace.uid === this.establishmentService.primaryWorkplace.uid) {
      this.requesterName = this.workplace.parentName;
    } else {
      this.requesterName = this.dataPermissionsRequester.name;
    }
  }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  private setupSummaryList(): void {
    this.summaryList = [
      {
        label: 'From',
        data: this.workplace.name,
      },
      {
        label: 'To',
        data: this.requesterName,
      },
    ];
  }

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }

  public cancelChangeOwnership() {
    let status = {
      approvalStatus: 'CANCELLED',
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
