import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show();
    this.submitted = false;
    this.subscriptions.add(this.userService.loggedInUser$.subscribe(user => (this.userDetails = user)));
  }

  public onResetPasswordSuccess(): void {
    this.submitted = true;
    this.router.navigate(['/account-management']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
