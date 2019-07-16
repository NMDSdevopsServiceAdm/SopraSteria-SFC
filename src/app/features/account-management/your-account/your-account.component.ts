import { Component, OnDestroy, OnInit } from '@angular/core';
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

  constructor(
    private userService: UserService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show();
    this.getUsername();
  }

  private getUsername() {
    this.subscriptions.add(
      this.userService.getUsernameFromEstbId().subscribe(data => {
        this.username = data.users[0].username;
        this.getUserSummary();
      })
    );
  }

  private getUserSummary() {
    this.subscriptions.add(
      this.userService.getUserDetails(this.username).subscribe((userDetails: UserDetails) => {
        this.user = userDetails;
        this.setAccountDetails();
        this.userService.updateState(userDetails);
      })
    );
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.user.fullname,
        route: '/account-management/change-your-details',
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
        route: '/account-management/change-password',
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
        route: '/account-management/change-user-security',
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
