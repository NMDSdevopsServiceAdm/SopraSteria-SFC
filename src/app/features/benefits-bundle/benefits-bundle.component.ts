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
  public revealTitle = `What's the ASC-WDS Benefits Bundle?`;
  public allOpen = false;
  public endorsedProvidersLinkFlag: boolean;
  public benefits = [
    {
      title: 'Discounts from Skills for Care’s endorsed training providers',
      open: false,
    },
    {
      title: '10% off Skills for Care’s eLearning modules',
      open: false,
    },
    {
      title: '10% off all publications in the Skills for Care bookshop',
      open: false,
    },
    {
      title: '10% off tailored seminars from Skills for Care',
      open: false,
    },
    {
      title: '5 FREE resources',
      open: false,
    },
  ];

  constructor(private establishmentService: EstablishmentService, private breadcrumbService: BreadcrumbService) {}

  public async ngOnInit(): Promise<void> {
    this.workplaceName = this.establishmentService.primaryWorkplace.name;
    this.workplaceId = this.establishmentService.primaryWorkplace.nmdsId;
    this.breadcrumbService.show(JourneyType.BENEFITS_BUNDLE);
  }

  public toggleAll(event: Event): void {
    event.preventDefault();
    this.allOpen = !this.allOpen;
    this.benefits.forEach((benefit) => (benefit.open = this.allOpen));
  }

  public updateOpenCloseAll(): void {
    const allAccordionsOpen = this.benefits.every((benefit) => benefit.open === true);
    this.allOpen = allAccordionsOpen ? true : false;
  }

  public toggleAccordion(index: number): void {
    this.benefits[index].open = !this.benefits[index].open;
    this.updateOpenCloseAll();
  }
}
