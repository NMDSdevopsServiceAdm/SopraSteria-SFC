import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Page } from '@core/model/page.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-wdf-find-out-more.component',
  templateUrl: './wdf-find-out-more.component.html',
})
export class WdfFindOutMoreComponent implements OnInit {
  public workplace: Establishment;
  public pages: Page;

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WDF);
    this.workplace = this.establishmentService.establishment;
    this.pages = this.route.snapshot.data.pages?.data[0];
  }

  public viewWdfMainPage(): void {
    this.router.navigate(['/wdf']);
  }
}
