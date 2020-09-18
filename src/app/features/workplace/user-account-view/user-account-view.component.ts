import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { SummaryList } from '@core/model/summary-list.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { UserAccountDeleteDialogComponent } from '@features/workplace/user-account-delete-dialog/user-account-delete-dialog.component';
import { Subscription } from 'rxjs';
import { take, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-user-account-view',
  templateUrl: './user-account-view.component.html',
})
export class UserAccountViewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canDeleteUser: boolean;
  public canEditUser: boolean;
  public canNavigate: boolean;
  public canResendActivationLink: boolean;
  public establishment: Establishment;
  public loggedInUser: UserDetails;
  public loginInfo: SummaryList[];
  public return: URLStructure;
  public user: UserDetails;
  public userInfo: SummaryList[];

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {
    this.user = this.route.snapshot.data.user;
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.setAccountDetails();
  }

  ngOnInit() {
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);

    this.subscriptions.add(
      this.userService
        .getAllUsersForEstablishment(this.establishment.uid)
        .pipe(take(1), withLatestFrom(this.userService.loggedInUser$))
        .subscribe(([users, loggedInUser]) => {
          this.loggedInUser = loggedInUser;
          this.setPermissions(users, loggedInUser);
        }),
    );

    this.subscriptions.add(
      this.userService.returnUrl$.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl ? returnUrl : { url: ['/workplace', this.establishment.uid] };
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public resendActivationLink(evet: Event) {
    event.preventDefault();
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
        },
      ),
    );
  }

  public onDeleteUser(event: Event) {
    event.preventDefault();
    const dialog = this.dialogService.open(UserAccountDeleteDialogComponent, { user: this.user });
    dialog.afterClosed.subscribe((deleteConfirmed) => {
      if (deleteConfirmed) {
        this.deleteUser();
      }
    });
  }

  private deleteUser() {
    if (this.user.isPrimary) {
      this.subscriptions.add(
        this.userService
          .updateUserDetails(this.establishment.uid, this.loggedInUser.uid, {
            ...this.loggedInUser,
            ...{ isPrimary: true },
          })
          .subscribe((data) => (this.userService.loggedInUser = data)),
      );
    }

    this.subscriptions.add(
      this.userService.deleteUser(this.establishment.uid, this.user.uid).subscribe(
        () => {
          this.router.navigate(this.return.url, { fragment: 'user-accounts' });
          this.alertService.addAlert({ type: 'success', message: 'User successfully deleted.' });
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the user.',
          });
        },
      ),
    );
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.user.fullname,
        route: { url: ['edit-details'] },
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

  private setPermissions(users: Array<UserDetails>, loggedInUser: UserDetails) {
    const canEditUser = this.permissionsService.can(this.establishment.uid, 'canEditUser');
    const isPending = this.user.username === null;
    const editUsersList = users.filter((user) => user.role === Roles.Edit);

    this.canDeleteUser =
      this.permissionsService.can(this.establishment.uid, 'canDeleteUser') &&
      users.length > 1 &&
      !this.user.isPrimary &&
      loggedInUser.uid !== this.user.uid;
    this.canResendActivationLink = canEditUser && isPending;
    this.canEditUser = canEditUser && (!this.user.isPrimary || (this.user.isPrimary && editUsersList.length > 1));
    this.canNavigate = Roles.Admin === loggedInUser.role;
  }
}
