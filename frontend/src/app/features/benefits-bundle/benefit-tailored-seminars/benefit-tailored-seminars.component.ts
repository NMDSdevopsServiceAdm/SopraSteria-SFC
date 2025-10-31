import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Page } from '@core/model/page.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
    selector: 'app-tailored-seminars',
    templateUrl: './benefit-tailored-seminars.component.html',
    standalone: false
})
export class TailoredSeminarsComponent implements OnInit {
  public pages: Page;
  public workplaceName: string;
  public workplaceID: string;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.pages = this.route.snapshot.data.pages?.data[0];
    this.workplaceName = this.establishmentService.establishment.name;
    this.workplaceID = this.establishmentService.establishment.nmdsId;
    this.breadcrumbService.show(JourneyType.BENEFITS_BUNDLE);
  }
}
