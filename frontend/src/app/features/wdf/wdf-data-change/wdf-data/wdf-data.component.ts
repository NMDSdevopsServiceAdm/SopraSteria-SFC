import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { WdfEligibilityStatus } from '../../../../core/model/wdf.model';
import { Worker } from '../../../../core/model/worker.model';

@Component({
  selector: 'app-wdf-data',
  templateUrl: './wdf-data.component.html',
})
export class WdfDataComponent implements OnInit {
  public workplace: Establishment;
  public workplaceUid: string;
  public primaryWorkplaceUid: string;
  public workers: Array<Worker>;
  public workerCount: number;
  public canViewWorker = false;
  public canEditWorker: boolean;
  public report: WDFReport;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public returnUrl: URLStructure;
  public wdfEligibilityStatus: WdfEligibilityStatus = {};
  public isStandalone = true;
  public newHomeDesignFlag: boolean;
  public standAloneAccount = false;
  private subscriptions: Subscription = new Subscription();
  private activeTabIndex: number;
  public parentOverallWdfEligibility: boolean;
  public overallWdfEligibility: boolean;
  public isParent: boolean;
  public workplaces = [];
  public tabs: { name: string; fragment: string }[] = [
    { name: 'Workplace', fragment: 'workplace' },
    { name: 'Staff records', fragment: 'staff' },
  ];

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private featureFlagsService: FeatureFlagsService,
    private userService: UserService,
    private router: Router,
  ) {
    this.featureFlagsService.start();
  }

  async ngOnInit(): Promise<void> {
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.standAloneAccount = this.establishmentService.standAloneAccount;
    this.isParent = this.establishmentService.establishment.isParent;

    if (this.route.snapshot?.params?.establishmentuid) {
      this.workplaceUid = this.route.snapshot.params.establishmentuid;
      this.returnUrl = { url: ['/wdf', 'workplaces', this.workplaceUid] };
    } else {
      this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
      this.returnUrl = { url: ['/wdf', 'data'] };
    }

    this.canViewWorker = this.permissionsService.can(this.workplaceUid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');

    this.getWorkers();
    this.setWorkplace();
    this.getWdfReport();
    this.setWorkerCount();
    this.getParentAndSubs();
    this.breadcrumbService.show(JourneyType.WDF);

    this.route.fragment.subscribe((fragment) => {
      const selectedTabIndex = this.tabs.findIndex((tab) => tab.fragment === fragment);
      this.activeTabIndex = selectedTabIndex !== -1 ? selectedTabIndex : 0;
    });
  }

  public get activeTab() {
    return { ...this.tabs[this.activeTabIndex], index: this.activeTabIndex }
  }

  private setWorkplace(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.workplaceUid, true).subscribe((workplace) => {
        this.workplace = workplace;
        this.establishmentService.setState(workplace);
        if (workplace.isParent) {
          this.tabs.push({ name: 'Your other workplaces', fragment: 'your-other-workplaces' });
        }
      }),
    );
  }

  private getWorkers(): void {
    if (this.canViewWorker) {
      this.subscriptions.add(
        this.workerService
          .getAllWorkers(this.workplaceUid)
          .pipe(take(1))
          .subscribe(({ workers }) => {
            this.workers = sortBy(workers, ['wdfEligible']);
            this.wdfEligibilityStatus.currentStaff = this.getStaffWdfEligibility(workers);
          }),
      );
    }
  }

  private getWdfReport() {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplaceUid).subscribe((report) => {
        this.report = report;
        this.setDates(report);
        this.setWdfEligibility(report);
      }),
    );
  }

  public handleTabChange(activeTabIndex: number): void {
    this.router.navigate(['/wdf/data'], { fragment: this.tabs[activeTabIndex].fragment });
  }

  private setWorkerCount() {
    this.subscriptions.add(
      this.workerService.getTotalStaffRecords(this.workplaceUid).subscribe((totalStaffRecords) => {
        this.workerCount = totalStaffRecords;
      }),
    );
  }

  private setDates(report: WDFReport): void {
    this.wdfStartDate = dayjs(report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = dayjs(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
  }

  private setWdfEligibility(report: WDFReport): void {
    this.wdfEligibilityStatus.overall = report.wdf.overall;
    this.wdfEligibilityStatus.currentWorkplace = report.wdf.workplace;
  }

  public getStaffWdfEligibility(workers: Worker[]): boolean {
    if (workers.length == 0) {
      return false;
    }
    return workers.every((worker) => worker.wdfEligible === true);
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
      }),
    );
  }

  public getParentOverallWdfEligibility(): void {
    this.parentOverallWdfEligibility = !this.workplaces.some((workplace) => {
      return workplace.wdf.overall === false;
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
