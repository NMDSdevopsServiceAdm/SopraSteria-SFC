import { Component, OnInit } from '@angular/core';

import { PasswordResetService } from '@core/services/password-reset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public resetLinkResponse: {};
  public validatePasswordResetResponse: {};
  public username = '';
  public headerToken: string;
  public submitted: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _passwordResetService: PasswordResetService,
  ) { }

  ngOnInit() {
    this.submitted = false;

    this._passwordResetService.resetPasswordUUID$.subscribe(resetLinkResponse => (
      this.resetLinkResponse = resetLinkResponse
    ));

    if (this.resetLinkResponse) {
      this.validatePasswordReset(this.resetLinkResponse);
    }
  }

  validatePasswordReset(data) {
    this.subscriptions.add(
      this._passwordResetService.validatePasswordReset(data.uuid).subscribe(res => {

        this.headerToken = res.headers.get('authorization');

        this.validatePasswordResetResponse = res;

        this.username = res.body['username'];
      })
    );
  }

  getresetPasswordSuccessData(responseData) {
    this.submitted = true;
  }

}
