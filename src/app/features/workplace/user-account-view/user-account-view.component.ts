import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { LoggedInSession } from '@core/model/logged-in.model';
import { Roles } from '@core/model/roles.enum';
import { SummaryList } from '@core/model/summary-list.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { UserService } from '@core/services/user.service';
import {
  UserAccountDeleteDialogComponent,
} from '@features/workplace/user-account-delete-dialog/user-account-delete-dialog.component';
import { Subscription } from 'rxjs';
import { take, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-user-account-view',
  templateUrl: './user-account-view.component.html',
})
export class UserAccountViewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public establishment: Establishment;
  public user: UserDetails;
  public userInfo: SummaryList[];
  public canDeleteUser: boolean;
  public canResendActivationLink: boolean;
  public canEdit: boolean;
  public return: URLStructure;

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

    this.subscriptions.add(
      this.userService
        .getAllUsersForEstablishment(this.establishment.uid)
        .pipe(
          take(1),
          withLatestFrom(this.authService.auth$)
        )
        .subscribe(([users, auth]) => {
          this.setPermissions(users, auth);
        })
    );

    this.subscriptions.add(
      this.userService.returnUrl$.pipe(take(1)).subscribe(returnUrl => {
        this.return = returnUrl ? returnUrl : { url: ['/workplace', this.establishment.uid] };
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public resendActivationLink() {
    this.subscriptions.add(
      this.userService.resendActivationLink(this.user.uid).subscribe(
        () => {
          this.router.navigate(this.return.url, { fragment: 'user-accounts' });
          this.alertService.addAlert({
            type: 'success',
            message: 'Account set up link has been resent.',
          });
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error resending account set up link.',
          });
        }
      )
    );
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
    this.subscriptions.add(
      this.userService.deleteUser(this.user.uid).subscribe(
        () => {
          this.router.navigate(this.return.url, { fragment: 'user-accounts' });
          this.alertService.addAlert({ type: 'success', message: 'User successfully deleted.' });
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the user.',
          });
        }
      )
    );
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
        data: this.user.username || '-',
      },
    ];
  }

  private setPermissions(users: Array<UserDetails>, auth: LoggedInSession) {
    const canEdit = auth && auth.role === Roles.Edit;
    const isPending = this.user.username === null;
    const isPrimary = this.user.isPrimary;
    const editUsersList = users.filter(user => user.role === Roles.Edit);

    this.canDeleteUser = canEdit && editUsersList.length > 1 && !isPrimary && auth.uid !== this.user.uid;
    this.canResendActivationLink = canEdit && isPending;
    this.canEdit = auth.role === Roles.Edit && users.length > 1;
  }
}
