import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { WDFReport } from '@core/model/reports.model';
import { WdfEligibilityStatus } from '@core/model/wdf.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-overview',
  templateUrl: './wdf-overview.component.html',
  styleUrls: ['../../../../shared/components/summary-section/summary-section.component.scss'],
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
  public sections: any = [];
  public staffOverallWdfEligibility: boolean;
  public wdfEligibilityStatus: WdfEligibilityStatus = {};

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    protected router: Router,
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
        if (workplaces.subsidaries) {
          this.workplaces = workplaces.subsidaries.establishments.filter((item) => item.ustatus !== 'PENDING');
        }
        this.workplaces.push(workplaces.primary);
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
      this.parentOverallEligibilityDate = dayjs(this.workplaces[0].wdf.overallWdfEligibility).format('D MMMM YYYY');
    }
  }

  private getWdfReport(): void {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplace.uid).subscribe((report) => {
        console.log(report.wdf);
        this.report = report;
        this.overallWdfEligibility = report.wdf.overall;
        this.wdfEligibilityStatus.overall = report.wdf.overall;
        this.wdfEligibilityStatus.currentWorkplace = report.wdf.workplace;
        this.wdfEligibilityStatus.currentStaff = report.wdf.staff;
        this.setDates(report);
        console.log(this.wdfEligibilityStatus);
      }),
    );
  }

  private setDates(report: WDFReport): void {
    this.wdfStartDate = dayjs(report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = dayjs(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
    this.overallEligibilityDate = dayjs(report.wdf.overallWdfEligibility).format('D MMMM YYYY');
    this.getSections();
  }

  public viewYourData(): void {
    this.router.navigate(['/wdf', 'data']);
  }

  public getSections(): void {
    const wdfStartYear = new Date(this.wdfStartDate).getFullYear();
    const wdfEndYear = new Date(this.wdfEndDate).getFullYear();

    const messages = [
      {
        eligible: false,
        message: `Your data does not meet the funding requirements for ${wdfStartYear} to ${wdfEndYear}`,
      },
      {
        eligible: true,
        message: `Your data has met the funding requirements for ${wdfStartYear} to ${wdfEndYear}`,
      },
    ];

    this.sections.push(
      {
        title: 'Workplace',
        message: messages.find((obj) => obj.eligible === this.wdfEligibilityStatus.currentWorkplace).message,
        eligibility: this.wdfEligibilityStatus.currentWorkplace,
        route: '/wdf/data',
        fragment: 'workplace',
      },
      {
        title: 'Staff records',
        message: messages.find((obj) => obj.eligible === this.wdfEligibilityStatus.currentStaff).message,
        eligibility: this.wdfEligibilityStatus.currentStaff,
        route: '/wdf/data',
        fragment: 'staff',
      },
    );

    console.log(`parent: ${this.isParent}`);
    console.log(`parent eligible: ${this.parentOverallWdfEligibility}`);

    if (this.isParent) {
      this.sections.push({
        title: 'Your other workplaces',
        message: messages.find((obj) => obj.eligible === this.parentOverallWdfEligibility).message,
        eligibility: this.parentOverallWdfEligibility,
        route: '/wdf/data',
        fragment: 'workplaces',
      });
    }
  }
}
