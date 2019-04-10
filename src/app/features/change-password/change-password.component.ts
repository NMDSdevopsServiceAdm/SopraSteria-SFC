import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '@core/services/auth-service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  public submitted: boolean;
  public userDetails: {};
  public establishment: any;
  private subscriptions: Subscription = new Subscription();

  constructor(private authService: AuthService, private _userService: UserService) {}

  ngOnInit() {
    this.submitted = false;

    this.establishment = this.authService.establishment.id;

    this.subscriptions.add(this._userService.userDetails$.subscribe(userDetails => (this.userDetails = userDetails)));
  }

  getresetPasswordSuccessData(responseData) {
    this.submitted = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
