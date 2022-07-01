import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-admin-account-view',
  templateUrl: './admin-account-view.component.html',
})
export class AdminAccountViewComponent implements OnInit {
  public user: UserDetails;

  constructor(private route: ActivatedRoute, private router: Router, public breadcrumbService: BreadcrumbService) {
    this.user = this.route.snapshot.data.adminUser;
  }

  public ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
    console.log(this.user);
  }
}
