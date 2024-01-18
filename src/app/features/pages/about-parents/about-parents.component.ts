import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Page } from '@core/model/page.model';
import {Location} from '@angular/common';

@Component({
  selector: 'app-about-parents',
  templateUrl: './about-parents.component.html',
})
export class AboutParentsComponent implements OnInit {
  public workplace: Establishment;
  public returnToHomeButton: boolean;
  public routeData: string;
  public pages: Page;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.WORKPLACE_TAB, this.workplace?.name);
    this.pages = this.route.snapshot.data.pages?.data[0];
  }

  returnToPreviousPage() {
    this._location.back();
  }
}
