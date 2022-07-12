import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Roles } from '@core/model/roles.enum';
import { SummaryList } from '@core/model/summary-list.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { DialogService } from '@core/services/dialog.service';
import { DeleteAdminUserComponent } from '../delete-admin-user/delete-admin-user.component';
import { Subscription } from 'rxjs';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';

@Component({
  selector: 'app-admin-account-view',
  templateUrl: './admin-account-view.component.html',
})
export class AdminAccountViewComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public user: UserDetails;
  public userDetails: SummaryList[];
  public canNavigate: boolean;
  public isAdminManager: boolean;
  public isPending: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public breadcrumbService: BreadcrumbService,
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private adminUsersService: AdminUsersService,
    public dialogService: DialogService,
  ) {
    this.user = this.route.snapshot.data.adminUser;
  }

  public ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
    this.isAdminManager = this.route.snapshot.data.loggedInUser.role === Roles.AdminManager;
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
}
