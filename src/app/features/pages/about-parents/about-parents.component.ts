import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { BreadcrumbService } from '@core/services/breadcrumb.service';
// import { Establishment } from '@core/model/establishment.model';
// import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-about-parents',
  templateUrl: './about-parents.component.html',
})
export class AboutParentsComponent implements OnInit {
  // public workplace: Establishment;
  // public workplaceUid: string;
  public test: string;

  // constructor(private establishmentService: EstablishmentService, private featureFlagsService: FeatureFlagsService) {}

  constructor(
  ) {}

  ngOnInit(): void {
    this.test = "TEST";
    // this.workplace = this.establishmentService.primaryWorkplace;
    // this.workplaceUid = this.workplace ? this.workplace.uid : null;
  }
}
