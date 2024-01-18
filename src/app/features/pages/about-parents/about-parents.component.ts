import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { Page } from '@core/model/page.model';

@Component({
  selector: 'app-about-parents',
  templateUrl: './about-parents.component.html',
})
export class AboutParentsComponent implements OnInit {
  public workplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public returnToHomeButton: boolean;
  public routeData: string;
  public pages: Page;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WORKPLACE_TAB);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.pages = this.route.snapshot.data.pages?.data[0];
    this.subscriptions.add(this.route.data.subscribe((data) => (this.returnToHomeButton = data.returnToHomeButton)));
  }
}
