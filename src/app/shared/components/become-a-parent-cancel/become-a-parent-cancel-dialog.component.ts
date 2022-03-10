import { Component, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
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
    private errorSummaryService: ErrorSummaryService,
    private parentRequestsService: ParentRequestsService,
    public dialog: Dialog<BecomeAParentCancelDialogComponent>,
    private alertService: AlertService,
    private router: Router,
  ) {
    super(data, dialog);
  }

  ngOnInit(): void {
    this.setupServerErrorsMap();
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not cancel parent request. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to cancel parent request.',
      },
      {
        name: 404,
        message: 'Cancel parent request to parent service not found. You can try again or contact us.',
      },
    ];
  }

  /**
   * Function is used to close dialog window after successful confirmation
   * @param {any} true to close dialog after response or null to close without action
   * @return {void}
   */
  public closeDialogWindow(confirm: any): void {
    this.dialog.close(confirm);
  }

  public cancelRequestToBecomeAParent(): void {
    this.subscriptions.add(
      this.parentRequestsService.cancelBecomeAParent().subscribe(
        () => {
          this.router.navigate(['/dashboard']);
          this.alertService.addAlert({
            type: 'success',
            message: 'Request to become a parent organisation has been cancelled.',
          });
          this.closeDialogWindow(true);
        },
        (error) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
