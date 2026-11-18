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
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';
import { take, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-user-account-view',
  templateUrl: './user-account-view.component.html',
  standalone: false,
})
export class UserAccountViewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public showDeleteButton: boolean;
  public deleteButtonRoute: string[];
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
  public isStaffRecordReadOnlyEnabled = false;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {
    this.user = this.route.snapshot.data.user;
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.setAccountDetails();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.userService.returnUrl.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl;
      }),
    );

    this.breadcrumbService.show(this.getBreadcrumbsJourney());

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

    this.isStaffRecordReadOnlyEnabled = this.user.canViewStaffRecords ?? false;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getBreadcrumbsJourney(): JourneyType {
    if (this.parentSubsidiaryViewService.getViewingSubAsParent()) {
      return JourneyType.SUBSIDIARY;
    } else if (this.return.fragment == null) {
      return JourneyType.MY_WORKPLACE;
    } else {
      return JourneyType.ALL_WORKPLACES;
    }
  }

  public resendActivationLink(event: Event): void {
    event.preventDefault();
    this.subscriptions.add(
      this.userService.resendActivationLink(this.user.uid).subscribe(
        () => {
          this.router.navigate(this.return.url, { fragment: this.return.fragment });
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

    this.router.navigate(this.deleteButtonRoute, { relativeTo: this.route });
  }

  private setPermissions(): void {
    const hasCanEditUserPermission = this.permissionsService.can(this.establishment.uid, 'canEditUser');
    const isPending = this.user.username === null;

    this.canResendActivationLink = hasCanEditUserPermission && isPending;
    this.canEditUser = hasCanEditUserPermission && (!this.user.isPrimary || this.moreThanOneActiveEditUser());
    this.canNavigate = isAdminRole(this.loggedInUser.role);
    this.setupDeleteUserButton();
  }

  private setupDeleteUserButton(): void {
    this.showDeleteButton = false;

    const hasDeletePermission = this.permissionsService.can(this.establishment.uid, 'canDeleteUser');
    const isDeletingSelfAccount = this.loggedInUser.uid === this.user.uid;

    if (!hasDeletePermission || isDeletingSelfAccount) {
      return;
    }

    const notPrimaryUser = !this.user.isPrimary;

    if (notPrimaryUser) {
      this.showDeleteButton = true;
      this.deleteButtonRoute = ['delete-user'];
      return;
    }

    const otherUserCanBeMadePrimary =
      this.userService.filterActiveNonPrimaryEditUsers(this.allUsers, this.user.uid!)?.length >= 1;

    if (otherUserCanBeMadePrimary) {
      this.showDeleteButton = true;
      this.deleteButtonRoute = ['select-primary-user-delete'];
      return;
    }

    const isParentOwnedSub = !!this.establishment.parentUid && this.establishment.dataOwner === 'Parent';
    const canDeletePrimaryUserWithoutReplacement = isParentOwnedSub;

    if (canDeletePrimaryUserWithoutReplacement) {
      this.showDeleteButton = true;
      this.deleteButtonRoute = ['delete-user'];
      return;
    }
  }

  public moreThanOneActiveEditUser(): boolean {
    return (
      this.allUsers.filter((user) => {
        return user.status === 'Active' && user.role === Roles.Edit;
      }).length > 1
    );
  }
}
