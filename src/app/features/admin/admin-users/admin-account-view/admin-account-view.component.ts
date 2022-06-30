import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-admin-account-view',
  templateUrl: './admin-account-view.component.html',
})
export class AdminAccountViewComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, public breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
  }
}
