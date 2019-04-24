import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  public submitted: boolean;
  public userDetails: UserDetails;
  public establishment: any;
  private subscriptions: Subscription = new Subscription();

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.submitted = false;
    this.establishment = this.authService.establishment.id;

    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => this.userDetails = userDetails)
    );
  }

  public onResetPasswordSuccess(): void {
    this.submitted = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
