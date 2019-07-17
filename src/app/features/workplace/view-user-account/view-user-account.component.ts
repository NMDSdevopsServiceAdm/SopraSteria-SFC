import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { SummaryList } from '@core/model/summary-list.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { UserService } from '@core/services/user.service';
import { take, withLatestFrom } from 'rxjs/operators';

import { UserAccountDeleteDialogComponent } from '../user-account-delete-dialog/user-account-delete-dialog.component';

@Component({
  selector: 'app-view-user-account',
  templateUrl: './view-user-account.component.html',
})
export class UserAccountViewComponent implements OnInit {
  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public establishment: Establishment;
  public user: UserDetails;
  public userInfo: SummaryList[];
  public canDeleteUser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    private authService: AuthService,
    private dialogService: DialogService,
    private alertService: AlertService
  ) {
    this.user = this.route.snapshot.data.user;
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.setAccountDetails();
  }

  ngOnInit() {
    this.breadcrumbService.show();

    this.userService
      .getAllUsersForEstablishment(this.establishment.uid)
      .pipe(
        take(1),
        withLatestFrom(this.authService.auth$)
      )
      .subscribe(([users, auth]) => {
        // TODO users can not delete themselves, but uid for LoggedInSession is not exposed so can't currently compare
        const editUsers = users.filter(user => user.role === 'Edit');
        this.canDeleteUser = auth && auth.role === 'Edit' && editUsers.length > 1 && !this.user.isPrimary;
      });
  }

  public onDeleteUser() {
    const dialog = this.dialogService.open(UserAccountDeleteDialogComponent, { user: this.user });
    dialog.afterClosed.subscribe(deleteConfirmed => {
      if (deleteConfirmed) {
        this.deleteUser();
      }
    });
  }

  private deleteUser() {
    this.userService
      .deleteUser(this.user.uid)
      .pipe(
        withLatestFrom(this.userService.returnUrl$),
        take(1)
      )
      .subscribe(([response, returnUrl]) => {
        this.router.navigate(returnUrl.url, { fragment: 'user-accounts' });
        this.alertService.addAlert({ type: 'success', message: 'User deleted [BE NOT IMPLEMENTED]' });
      });
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.user.fullname,
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
      },
      {
        label: 'Password',
        data: '******',
      },
    ];
  }
}
