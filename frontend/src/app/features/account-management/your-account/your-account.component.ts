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
  standalone: false,
})
export class YourAccountComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public user: UserDetails;
  public username: string;

  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public userInfo: SummaryList[];
  public userResearchInfo: SummaryList[];

  constructor(
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
  ) {}

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
    const showFlagForUserResearchQuestion =
      !this.user.viewedUserResearchQuestion && !this.user.userResearchInviteResponse;

    this.userInfo = [
      {
        label: 'Full name',
        data: this.user.fullname,
        route: { url: ['/account-management/change-your-details'] },
        ariaDescription: 'your personal details',
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
        label: 'Phone number',
        data: this.user.phone,
      },
    ];

    this.loginInfo = [
      {
        label: 'Username',
        data: this.user.username,
        route: { url: ['/account-management/change-password'] },
        ariaDescription: 'your password',
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
        ariaDescription: 'your security question and answer',
      },
      {
        label: 'Security answer',
        data: this.user.securityQuestionAnswer,
      },
    ];

    this.userResearchInfo = [
      {
        label: 'User research sessions',
        data: this.user.userResearchInviteResponse,
        route: { url: ['/account-management/user-research-invite'] },
        showNewFlag: showFlagForUserResearchQuestion,
        ariaDescription: 'your reply regarding taking part in our user research sessions',
      },
    ];
  }

  public setViewedUserResearchQuestion(): void {
    if (this.user.viewedUserResearchQuestion) {
      return;
    }

    const update = { viewedUserResearchQuestion: true };
    this.subscriptions.add(this.userService.updateUserFlags(this.user.uid!, update).subscribe());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
