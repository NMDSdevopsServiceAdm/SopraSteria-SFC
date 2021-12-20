import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Page } from '@core/model/page.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-benefits-training-discounts',
  templateUrl: './benefits-training-discounts.component.html',
})
export class BenefitsTrainingDiscountsComponent implements OnInit {
  public pages: Page;
  public workplaceName: string;
  public revealTitle = `What's an endorsed training provider?`;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.pages = this.route.snapshot.data.pages?.data[0];
    this.workplaceName = this.establishmentService.primaryWorkplace.name;
    this.breadcrumbService.show(JourneyType.BENEFITS_BUNDLE);
  }
}
