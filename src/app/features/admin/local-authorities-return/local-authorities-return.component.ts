import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-local-authorities-return',
  templateUrl: './local-authorities-return.component.html',
})
export class LocalAuthoritiesReturnComponent implements OnInit {
  public startDate: Date;
  public endDate: Date;

  constructor(private breadcrumbService: BreadcrumbService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN);
    this.startDate = new Date(this.route.snapshot.data.dates.laReturnStartDate);
    this.endDate = new Date(this.route.snapshot.data.dates.laReturnEndDate);
  }
}
