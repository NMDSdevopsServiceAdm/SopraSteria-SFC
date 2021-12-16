import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-parent-requests-list',
  templateUrl: './parent-requests-list.component.html',
})
export class ParentRequestsListComponent implements OnInit {
  public parentRequests = [];

  constructor(private route: ActivatedRoute, public breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.parentRequests = this.route.snapshot.data.parentRequests;
    this.setBreadcrumbs();
  }

  public setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.PARENT_REQUESTS);
  }
}
