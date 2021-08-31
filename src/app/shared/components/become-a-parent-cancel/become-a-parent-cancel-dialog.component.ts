import { Component, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-become-a-parent-cancel-dialog',
  templateUrl: './become-a-parent-cancel-dialog.component.html',
})
export class BecomeAParentCancelDialogComponent extends DialogComponent implements OnDestroy {
  public dataPermissions: DataPermissions[];
  public workplace: Workplace;
  protected subscriptions: Subscription = new Subscription();
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public linktoParentRequstedId;
  public linktoParentRequstedParentName;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private parentRequestsService: ParentRequestsService,
    public dialog: Dialog<BecomeAParentCancelDialogComponent>,
    private alertService: AlertService,
    private router: Router,
  ) {
    super(data, dialog);
  }

  /**
   * Function is used to close dialog window after successful confirmation
   * @param {any} true to close dialog after response or null to close without action
   * @return {void}
   */
  public closeDialogWindow(confirm: any): void {
    this.dialog.close(confirm);
  }

  public canelRequestToBecomeAParent(): void {
    this.subscriptions.add(
      this.parentRequestsService.cancelBecomeAParent().subscribe((data) => {
        if (data) {
          this.router.navigate(['/dashboard']);
          this.alertService.addAlert({
            type: 'success',
            message: 'Request to become a parent organisation has been cancelled.',
          });
        }
        this.closeDialogWindow(true);
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
