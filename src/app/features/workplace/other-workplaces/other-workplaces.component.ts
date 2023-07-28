import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { WDFReport } from '@core/model/reports.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-other-workplaces',
  templateUrl: './other-workplaces.component.html',
})
export class OtherWorkplacesComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public totalWorkplaceCount: number;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.OTHER_WORKPLACES);
    this.workplace = this.establishmentService.primaryWorkplace;
    const childWorkplaces = this.route.snapshot.data.childWorkplaces;
    this.totalWorkplaceCount = childWorkplaces.count;
    console.log(this.totalWorkplaceCount);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
