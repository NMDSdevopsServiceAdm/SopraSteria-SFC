import { Component, OnInit, OnDestroy } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { PasswordResetService } from '@core/services/password-reset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  public resetLinkResponse: {};
  public resetUuidfromUrl: string;
  public validatePasswordResetResponse: {};
  public username = '';
  public headerToken: string;
  public submitted: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private _passwordResetService: PasswordResetService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.submitted = false;

    this.route.queryParams.subscribe(params => {
      this.resetUuidfromUrl = params['reset'];
    });

    this._passwordResetService.resetPasswordUUID$.subscribe(resetLinkResponse => {
      this.resetLinkResponse = resetLinkResponse;
    });

    if (this.resetUuidfromUrl) {
      this.validatePasswordReset(this.resetUuidfromUrl);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  validatePasswordReset(data) {
    this.subscriptions.add(
      this._passwordResetService.validatePasswordReset(data).subscribe(res => {
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
