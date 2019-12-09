import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-link-to-parent-cancel-dialog',
  templateUrl: './link-to-parent-cancel-dialog.component.html',
})
export class LinkToParentCancelDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public dataPermissions: DataPermissions[];
  public workplace: Workplace;
  protected subscriptions: Subscription = new Subscription();
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public linktoParentRequstedId;
  public linktoParentRequstedParentName;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private establishmentService: EstablishmentService,
    private errorSummaryService: ErrorSummaryService,
    public dialog: Dialog<LinkToParentCancelDialogComponent>,
    private alertService: AlertService
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.workplace = this.data;
    this.setupServerErrorsMap();
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not send request to parent. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to send request to parent.',
      },
      {
        name: 404,
        message: 'Send request to parent service not found. You can try again or contact us.',
      },
    ];
  }

  /**
   * Function is used to close dialog window after successful confirmation
   * @param {boolean} true to close dialog
   * @return {void}
   */
  public closeDialogWindow(confirm: boolean) {
    this.dialog.close(confirm);
  }

  /**
   * Function is used to send cancel request to server for parent linking with request payload selected parent's uid and permission type
   * @param {void}
   * @return {void}
   */
  public cancelRequestToParent() {
    this.subscriptions.add(
      this.establishmentService
        .cancelRequestToParentForLink(this.workplace.uid, { approvalStatus: 'CANCELLED' })
        .subscribe(
          data => {
            if (data) {
              this.workplace.linkToParentRequested = null;
              const parentName = data[0].requstedParentName;
              this.alertService.addAlert({
                type: 'success',
                message: `Request to link to ${parentName} has been cancelled.`,
              });
              this.closeDialogWindow(true);
            }
          },
          error => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          }
        )
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
