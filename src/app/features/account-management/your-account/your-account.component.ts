import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { SummaryList } from '@core/model/summary-list.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-your-account-summary',
  templateUrl: './your-account.component.html',
})
export class YourAccountComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public user: UserDetails;
  public userInfo: SummaryList[];
  public username: string;

  constructor(private userService: UserService, private breadcrumbService: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.ACCOUNT);

    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe((user) => {
        if (user) {
          this.user = user;
          this.setAccountDetails();
        }
      }),
    );
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.user.fullname,
        route: { url: ['/account-management/change-your-details'] },
      },
      {
        label: 'Job title',
        data: this.user.jobTitle,
      },
      {
        label: 'Email address',
        data: this.user.email,
      },
      {
        label: 'Contact phone',
        data: this.user.phone,
      },
    ];

    this.loginInfo = [
      {
        label: 'Username',
        data: this.user.username,
        route: { url: ['/account-management/change-password'] },
      },
      {
        label: 'Password',
        data: '******',
      },
    ];

    this.securityInfo = [
      {
        label: 'Security question',
        data: this.user.securityQuestion,
        route: { url: ['/account-management/change-user-security'] },
      },
      {
        label: 'Security answer',
        data: this.user.securityQuestionAnswer,
      },
    ];
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
