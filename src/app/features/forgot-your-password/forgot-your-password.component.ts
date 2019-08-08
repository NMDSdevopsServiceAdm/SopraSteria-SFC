import { Component, OnInit, OnDestroy } from '@angular/core';

import { PasswordResetService } from '@core/services/password-reset.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-forgot-your-password',
  templateUrl: './forgot-your-password.component.html',
})
export class ForgotYourPasswordComponent implements OnInit, OnDestroy {
  public usernameOrEmail: string;
  uuid: {};

  public submitted: boolean;
  public resetPasswordLink: string;
  private subscriptions: Subscription = new Subscription();
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  constructor(private _passwordResetService: PasswordResetService, private errorSummaryService: ErrorSummaryService) {}

  ngOnInit() {
    this.submitted = false;

    this._passwordResetService.resetPasswordUUID$.subscribe(uuid => (this.uuid = uuid));
    this.setupServerErrorsMap();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getChildFormData(formData) {
    if (formData) {
      this.usernameOrEmail = formData;

      this.subscriptions.add(
        this._passwordResetService.requestPasswordReset(this.usernameOrEmail).subscribe(
          data => {
            this.displayConfirmation(data);
          },
          (error: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          }
        )
      );
    }
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  displayConfirmation(data) {
    this.submitted = true;

    this._passwordResetService.updateState(data);

    const resetPasswordUuid = data.uuid;
    this.resetPasswordLink = '/reset-password/?reset=' + resetPasswordUuid;
  }
}
