import { Component, OnInit, OnDestroy } from '@angular/core';

import { PasswordResetService } from '@core/services/password-reset.service';
import { Subscription } from 'rxjs';

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

  constructor(
    private _passwordResetService: PasswordResetService,
  ) { }

  ngOnInit() {
    this.submitted = false;

    this._passwordResetService.resetPasswordUUID$.subscribe(uuid => (this.uuid = uuid));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getChildFormData(formData) {
    if(formData) {
      this.usernameOrEmail = formData;

      this.subscriptions.add(
        this._passwordResetService.requestPasswordReset(this.usernameOrEmail).subscribe(data => {
          this.displayConfirmation(data);
        })
      );
    }
  }

  displayConfirmation(data) {
    this.submitted = true;

    this._passwordResetService.updateState(data);

    const resetPasswordUuid = data.uuid;
    this.resetPasswordLink = '/reset-password/?reset=' + resetPasswordUuid;
  }

}
