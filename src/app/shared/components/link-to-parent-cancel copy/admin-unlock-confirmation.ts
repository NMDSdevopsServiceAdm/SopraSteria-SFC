import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-unlock-confirmation',
  templateUrl: './admin-unlock-confirmation.html',
})
export class AdminUnlockConfirmationDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public dataPermissions: DataPermissions[];
  protected subscriptions: Subscription = new Subscription();
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private errorSummaryService: ErrorSummaryService,
    private registrationsService: RegistrationsService,
    public dialog: Dialog<AdminUnlockConfirmationDialogComponent>,
    private alertService: AlertService
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.setupServerErrorsMap();
    console.log(this.data);
  }

  // setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not unlock the users account. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to unlock account.',
      },
      {
        name: 404,
        message: 'Send request to unlock service not found. You can try again or contact us.',
      },
    ];
  }

  /**
   * Function is used to close dialog window after successful confirmation
   * @param {any} true to close dialog after response or null to close without action
   * @return {void}
   */
  public closeDialogWindow(confirm: any) {
    this.dialog.close(confirm);
  }

  /**
   * Unlock a users account
   * @param {string}
   * @return {void}
   */
  public unlockUser(username: string) {
    this.registrationsService.unlockAccount({username}).subscribe(
      data => {
        this.alertService.addAlert({
          type: 'success',
          message: `User account has been unlocked.`,
        });
        this.closeDialogWindow(true);
      },
      error => {
        this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
      }
    );
  }


  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
