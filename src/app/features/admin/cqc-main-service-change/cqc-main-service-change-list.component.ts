import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-cqc-main-service-change-list',
  templateUrl: './cqc-main-service-change-list.component.html',
})
export class CQCMainServiceChangeListComponent implements OnInit {
  public pendingCQCMainServiceChanges: any;

  constructor(private route: ActivatedRoute, public breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.pendingCQCMainServiceChanges = this.route.snapshot.data.cqcStatusChangeList;
    this.setBreadcrumbs();
  }

  public setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.CQC_MAIN_SERVICE_CHANGE);
  }

  public setStatusClass(status: string): string {
    return status === 'Pending' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }
}
