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
import { Subscription } from 'rxjs';
import { take, withLatestFrom } from 'rxjs/operators';

import { isAdminRole } from '../../../../../server/utils/adminUtils';

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
  public allUsers: UserDetails[];

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

  ngOnInit(): void {
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);

    this.subscriptions.add(
      this.userService
        .getAllUsersForEstablishment(this.establishment.uid)
        .pipe(take(1), withLatestFrom(this.userService.loggedInUser$))
        .subscribe(([users, loggedInUser]) => {
          this.loggedInUser = loggedInUser;
          this.allUsers = users;
          this.setPermissions();
        }),
    );

    this.subscriptions.add(
      this.userService.returnUrl$.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl ? returnUrl : { url: ['/workplace', this.establishment.uid, 'users'] };
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public resendActivationLink(event: Event): void {
    event.preventDefault();
    this.subscriptions.add(
      this.userService.resendActivationLink(this.user.uid).subscribe(
        () => {
          this.router.navigate(this.return.url, { fragment: 'users' });
          this.alertService.addAlert({
            type: 'success',
            message: 'The user set-up email has been sent again.',
          });
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error resending the user set-up email.',
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
        label: 'Phone number',
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

  public deleteUserNavigation(event: Event): void {
    event.preventDefault();
    const route = this.user.isPrimary ? 'select-primary-user-delete' : 'delete-user';
    this.router.navigate([route], { relativeTo: this.route });
  }

  private setPermissions(): void {
    const hasCanEditUserPermission = this.permissionsService.can(this.establishment.uid, 'canEditUser');
    const isPending = this.user.username === null;

    this.canDeleteUser =
      this.permissionsService.can(this.establishment.uid, 'canDeleteUser') && this.loggedInUser.uid !== this.user.uid;

    this.canResendActivationLink = hasCanEditUserPermission && isPending;
    this.canEditUser = hasCanEditUserPermission && (!this.user.isPrimary || this.moreThanOneActiveEditUser());
    this.canNavigate = isAdminRole(this.loggedInUser.role);
  }

  public moreThanOneActiveEditUser(): boolean {
    return (
      this.allUsers.filter((user) => {
        return user.status === 'Active' && user.role === Roles.Edit;
      }).length > 1
    );
  }
}
