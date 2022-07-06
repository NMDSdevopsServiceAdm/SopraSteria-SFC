import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  public users: UserDetails[] = [];
  public canViewUser = true;
  public flow: string;
  public adminManager: boolean;

  constructor(private route: ActivatedRoute, private router: Router, public breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.adminManager = this.route.snapshot.data.loggedInUser.role === Roles.AdminManager;
    this.users = this.route.snapshot.data.adminUsers.adminUsers;
    this.flow = this.router.url;
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
  }

  public navigateToAddAdminUserPage(): void {
    this.router.navigate([this.flow, 'add-admin']);
  }
}
