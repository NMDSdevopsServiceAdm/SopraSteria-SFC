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
  public workplaceId: string;
  public revealTitle = "What's the ASC-WDS Benefits Bundle?";
  public allOpen = false;
  public benefits = [
    {
      name: '10% off all publications in the Skills for Care bookshop',
      open: false,
    },
    {
      name: '10% off values-based interviewing seminars',
      open: false,
    },
    {
      name: '10% off valuable conversations online seminars',
      open: false,
    },
    {
      name: '10% off off registered manager membership',
      open: false,
    },
    {
      name: '10% off digital learning for managers modules',
    },
    {
      name: 'Funded essential training',
      open: false,
    },
    {
      name: '5 of our top FREE digital downloads',
      open: false,
    },
  ];

  constructor(private establishmentService: EstablishmentService, private breadcrumbService: BreadcrumbService) {}

  public ngOnInit(): void {
    this.workplaceName = this.establishmentService.primaryWorkplace.name;
    this.workplaceId = this.establishmentService.primaryWorkplace.nmdsId;
    this.breadcrumbService.show(JourneyType.BENEFITS_BUNDLE);
  }

  public toggleAll(): void {
    this.allOpen = !this.allOpen;
    this.benefits.forEach((benefit) => (benefit.open = this.allOpen));
  }
}
