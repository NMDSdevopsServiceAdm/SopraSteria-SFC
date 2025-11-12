import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { WDFReport } from '@core/model/reports.model';
import { WdfEligibilityStatus } from '@core/model/wdf.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-wdf-overview',
    templateUrl: './wdf-overview.component.html',
    styleUrls: ['../../../shared/components/summary-section/summary-section.component.scss'],
    standalone: false
})
export class WdfOverviewComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public report: WDFReport;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public overallWdfEligibility: boolean;
  public parentOverallWdfEligibility: boolean;
  public subsidiariesOverallWdfEligibility: boolean;
  public someSubsidiariesMeetingRequirements: boolean;
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
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    protected router: Router,
    public route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WDF);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace.isParent;

    this.report = this.route.snapshot.data?.report;
    this.setEligibilityStatus();
    this.setDates();

    if (this.isParent) {
      this.getParentAndSubs();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getParentAndSubs(): void {
    this.subscriptions.add(
      this.userService.getEstablishments(true).subscribe((workplaces: GetWorkplacesResponse) => {
        if (workplaces.subsidaries) {
          const activeSubsidiaryWorkplaces = workplaces.subsidaries.establishments.filter(
            (item) => item.ustatus !== 'PENDING',
          );

          this.workplaces = [...activeSubsidiaryWorkplaces, workplaces.primary];
          this.workplaces = orderBy(this.workplaces, ['wdf.overall', 'wdf.overallWdfEligibility'], ['desc', 'desc']);

          this.getParentOverallWdfEligibility();
          this.getLastOverallEligibilityDate();
          this.setSubsidiariesEligibility(activeSubsidiaryWorkplaces);
        }
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

  public setSubsidiariesEligibility(subsidiaryWorkplaces): void {
    this.subsidiariesOverallWdfEligibility = subsidiaryWorkplaces.every((workplace) => workplace.wdf.overall === true);
    this.someSubsidiariesMeetingRequirements = subsidiaryWorkplaces.some((workplace) => workplace.wdf.overall === true);
  }

  private setEligibilityStatus(): void {
    this.overallWdfEligibility = this.report.wdf.overall;
    this.wdfEligibilityStatus.overall = this.report.wdf.overall;
    this.wdfEligibilityStatus.currentWorkplace = this.report.wdf.workplace;
    this.wdfEligibilityStatus.currentStaff = this.report.wdf.staff;
  }

  private setDates(): void {
    this.wdfStartDate = dayjs(this.report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = dayjs(this.report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
    this.overallEligibilityDate = dayjs(this.report.wdf.overallWdfEligibility).format('D MMMM YYYY');
  }

  public viewYourData(): void {
    this.router.navigate(['data'], { relativeTo: this.route });
  }
}
