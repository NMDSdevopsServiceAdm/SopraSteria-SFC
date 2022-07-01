import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { SummaryList } from '@core/model/summary-list.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-admin-account-view',
  templateUrl: './admin-account-view.component.html',
})
export class AdminAccountViewComponent implements OnInit {
  public user: UserDetails;
  public userDetails: SummaryList[];
  public canNavigate: boolean;

  constructor(private route: ActivatedRoute, private router: Router, public breadcrumbService: BreadcrumbService) {
    this.user = this.route.snapshot.data.adminUser;
  }

  public ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
    this.setAdminUserDetails();
  }

  public isAdminManager(): boolean {
    return this.user.role === 'AdminManager';
  }

  private setAdminUserDetails(): void {
    this.userDetails = [
      {
        label: 'Full name',
        data: this.user.fullname,
        route: this.isAdminManager() ? { url: ['edit'] } : undefined,
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
