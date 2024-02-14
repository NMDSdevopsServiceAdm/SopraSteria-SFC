import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Page } from '@core/model/page.model';
import { Location } from '@angular/common';
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
  public previousPageText: string;
  public journeyType = JourneyType.WORKPLACE_TAB;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private _location: Location,
    private previousRouteService: PreviousRouteService
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.pages = this.route.snapshot.data.pages?.data[0];
    this.setPreviousPageText();
    this.breadcrumbService.show(this.showJourneyType(), this.workplace?.name);
  }

  private setPreviousPageText() {
    if(this.previousRouteService.getPreviousPage() != "about parents") {
      this.previousPageText = this.previousRouteService.getPreviousPage();

      if(this.previousPageText == "view all workplaces") {
        this.previousPageText = "your other workplaces";
        this.journeyType = JourneyType.ALL_WORKPLACES;
      } else if(this.previousPageText == "workplace") {
        this.previousPageText = "your workplace";
        this.journeyType = JourneyType.WORKPLACE_TAB;
      }
    }
  }

  private showJourneyType(): any {
    return this.journeyType;
  }

  returnToPreviousPage() {
    this._location.back();
  }
}
