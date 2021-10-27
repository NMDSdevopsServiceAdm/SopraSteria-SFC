import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-benefits-bundle',
  templateUrl: './benefits-bundle.component.html',
})
export class BenefitsBundleComponent implements OnInit {
  public workplaceName: string;
  public revealTitle = "What's the ASC-WDS Benefits Bundle?";

  constructor(private establishmentService: EstablishmentService, private breadcrumbService: BreadcrumbService) {}

  public ngOnInit(): void {
    this.workplaceName = this.establishmentService.primaryWorkplace.name;
    this.breadcrumbService.show(JourneyType.BENEFITS_BUNDLE);
  }
}
