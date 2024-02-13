import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Page } from '@core/model/page.model';
import {Location} from '@angular/common';
import { PreviousRouteService } from '../../../core/services/previous-route.service';

@Component({
  selector: 'app-about-parents',
  templateUrl: './about-parents.component.html',
})
export class AboutParentsComponent implements OnInit {
  public workplace: Establishment;
  public returnToHomeButton: boolean;
  public routeData: string;
  public pages: Page;
  public previousPage: string;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private previousRouteService: PreviousRouteService
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.WORKPLACE_TAB, this.workplace?.name);
    this.pages = this.route.snapshot.data.pages?.data[0];

    if(this.previousRouteService.getPreviousPage() != "about parents") {
      this.previousPage = this.previousRouteService.getPreviousPage();

      // temporary as the url for your other workplaces is view all workplaces
      if(this.previousPage == "view all workplaces") {
        this.previousPage = "your other workplaces";
      }
    }
  }

  returnToPreviousPage() {
    this._location.back();
    // this.router.navigate(this.previousRouteService.getPreviousUrl());
  }
}
