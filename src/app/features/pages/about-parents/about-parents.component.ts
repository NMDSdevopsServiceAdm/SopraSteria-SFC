import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-about-parents',
  templateUrl: './about-parents.component.html',
})
export class AboutParentsComponent implements OnInit {
  public workplace: Establishment;
  public workplaceUid: string;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WORKPLACE_TAB);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.workplace ? this.workplace.uid : null;
  }
}
