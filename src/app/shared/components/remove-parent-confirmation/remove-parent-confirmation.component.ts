import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-remove-parent-confirmation',
  templateUrl: './remove-parent-confirmation.component.html',
})
export class RemoveParentConfirmationComponent extends DialogComponent implements OnInit, OnDestroy {
  public dataPermissions: DataPermissions[];
  protected subscriptions: Subscription = new Subscription();
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private errorSummaryService: ErrorSummaryService,
    public dialog: Dialog<RemoveParentConfirmationComponent>,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
  ) {
    super(data, dialog);
  }

  ngOnInit(): void {
    this.setupServerErrorsMap();
  }

  // setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not remove the parent status from this workplace. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to unlock account.',
      },
      {
        name: 401,
        message: 'Send request to unlock service not found. You can try again or contact us.',
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

  /**
   * Unlock a users account
   * @param {string}
   * @return {void}
   */
  public removeParentStatus(data: any): void {
    this.establishmentService.removeParentStatus(data).subscribe(
      () => {
        data.removeStatus();
        this.alertService.addAlert({
          type: 'success',
          message: 'Parent status has been removed,',
        });
        this.closeDialogWindow(true);
      },
      (error) => {
        console.error(error);
        this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
      },
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
