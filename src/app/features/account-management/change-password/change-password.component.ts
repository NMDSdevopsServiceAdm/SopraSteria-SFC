import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  public submitted: boolean;
  public userDetails: UserDetails;
  private subscriptions: Subscription = new Subscription();

  constructor(private breadcrumbService: BreadcrumbService, private userService: UserService) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.ACCOUNT);
    this.submitted = false;
    this.subscriptions.add(this.userService.loggedInUser$.subscribe((user) => (this.userDetails = user)));
  }

  public onResetPasswordSuccess(): void {
    this.submitted = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
