import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Roles } from '@core/model/roles.enum';
import { SummaryList } from '@core/model/summary-list.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { DialogService } from '@core/services/dialog.service';
import { DeleteAdminUserComponent } from '../delete-admin-user/delete-admin-user.component';
import { Subscription } from 'rxjs';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-account-view',
  templateUrl: './admin-account-view.component.html',
})

export class AdminAccountViewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public user: UserDetails;
  public userDetails: SummaryList[];
  public canNavigate: boolean;
  public isAdminManager: boolean;
  public isPending: boolean;
  public return: URLStructure;

  constructor(
    private route: ActivatedRoute,
    public breadcrumbService: BreadcrumbService,
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private adminUsersService: AdminUsersService,
    public dialogService: DialogService,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.user = this.route.snapshot.data.adminUser;
  }

  public ngOnInit(): void {
    this.setUserServiceReturnUrl();
    this.subscriptions.add(
      this.userService.returnUrl.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl;
      }),
    );
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
    this.isAdminManager = this.userService.loggedInUser.role === Roles.AdminManager;
    this.isPending = this.setIsPending();
    this.setAdminUserDetails();
  }

  public deleteUserModal(event: Event): void {
    event.preventDefault();
    this.dialogService.open(DeleteAdminUserComponent, {}).afterClosed.subscribe((deleteConfirmed) => {
      if (deleteConfirmed) {
        this.onDeleteUser();
      }
    });
  }

  public onDeleteUser(): void {
    this.subscriptions.add(
      this.adminUsersService.deleteAdminUserDetails(this.user.uid).subscribe(
        () => {
          this.adminUsersService.getAdminUsers().subscribe(() => {
            this.router.navigate(['/sfcadmin', 'users']);
          });
        },
        (error) => console.log(error),
      ),
    );
  }

  public setIsPending(): boolean {
    return this.user.username === null;
  }

  public resendActivationLink(event: Event): void {
    event.preventDefault();

    this.subscriptions.add(
      this.adminUsersService.resendActivationLinkAdmin(this.user.uid).subscribe(
        () => {
          this.router.navigate(this.return.url);
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

  private setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: ['/sfcadmin/users'],
    });
  }

  private setAdminUserDetails(): void {
    this.userDetails = [
      {
        label: 'Full name',
        data: this.user.fullname,
        route: this.isAdminManager ? { url: ['edit'] } : undefined,
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
      {
        label: 'Username',
        data: this.user.username || '-',
      },
      {
        label: 'Permissions',
        data: this.user.role === 'AdminManager' ? 'Admin manager' : this.user.role,
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
