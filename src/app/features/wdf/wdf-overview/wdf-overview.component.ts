import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { WDFReport } from '@core/model/reports.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { orderBy } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-overview',
  templateUrl: './wdf-overview.component.html',
})
export class WdfOverviewComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public primaryWorkplace: Establishment;
  public report: WDFReport;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public overallWdfEligibility: boolean;
  public parentOverallWdfEligibility: boolean;
  public overallEligibilityDate: string;
  public parentOverallEligibilityDate: string;
  public isParent: boolean;
  public workplaceUid: string;
  public workplaces = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WDF);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace.isParent;

    this.getParentAndSubs();
    this.getWdfReport();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getParentAndSubs(): void {
    this.subscriptions.add(
      this.userService.getEstablishments(true).subscribe((workplaces: GetWorkplacesResponse) => {
        this.workplaces.push(workplaces.primary);
        if (workplaces.subsidaries) {
          this.workplaces = workplaces.subsidaries.establishments.filter((item) => item.ustatus !== 'PENDING');
        }
        this.workplaces = orderBy(this.workplaces, ['wdf.overall', 'updated'], ['asc', 'desc']);
        this.getParentOverallWdfEligibility();
        this.getLastOverallEligibilityDate();
      }),
    );
  }

  public getParentOverallWdfEligibility(): void {
    this.parentOverallWdfEligibility = !this.workplaces.some((workplace) => {
      return workplace.wdf.overall === false;
    });
  }

  public getLastOverallEligibilityDate(): void {
    if (this.parentOverallWdfEligibility) {
      this.parentOverallEligibilityDate = moment(this.workplaces[0].wdf.overallWdfEligibility).format('D MMMM YYYY');
    }
  }

  private getWdfReport(): void {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplace.uid).subscribe((report) => {
        this.report = report;
        this.overallWdfEligibility = report.wdf.overall;
        this.setDates(report);
      }),
    );
  }

  private setDates(report: WDFReport): void {
    this.wdfStartDate = moment(report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = moment(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
    this.overallEligibilityDate = moment(report.wdf.overallWdfEligibility).format('D MMMM YYYY');
  }
}
