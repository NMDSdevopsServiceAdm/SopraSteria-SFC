import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import {
  WdfWorkplaceConfirmationDialogComponent,
} from '@features/workplace/wdf-workplace-confirmation-dialog/wdf-workplace-confirmation-dialog.component';
import { sortBy } from 'lodash';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf',
  templateUrl: './wdf.component.html',
})
export class WdfComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public workers: Array<Worker>;
  public workerCount: number;
  public report: WDFReport;
  public returnUrl: URLStructure;
  public exitUrl: URLStructure;
  public canViewStaffRecords: boolean;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private reportService: ReportService,
    private workerService: WorkerService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show();
    const workplaceUid = this.route.snapshot.params.establishmentuid;

    this.canViewStaffRecords = this.userService.loggedInUser.role === (Roles.Edit || Roles.Admin);
    this.returnUrl = { url: ['/workplace', workplaceUid, 'reports', 'wdf'] };
    this.exitUrl = { url: ['/workplace', workplaceUid, 'reports'] };
    this.workerService.setReturnTo(null);

    this.subscriptions.add(
      combineLatest(
        this.establishmentService.getEstablishment(workplaceUid, true),
        this.reportService.getWDFReport(workplaceUid),
        this.workerService.getTotalStaffRecords(workplaceUid)
      )
        .pipe(take(1))
        .subscribe(([workplace, report, totalStaffRecords]) => {
          this.report = report;
          this.workplace = workplace;
          this.workerCount = totalStaffRecords;
        })
    );

    if (this.canViewStaffRecords) {
      this.subscriptions.add(
        this.workerService
          .getAllWorkers(workplaceUid)
          .pipe(take(1))
          .subscribe(workers => {
            this.workers = sortBy(workers, ['wdfEligible']);
          })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public onConfirmAndSubmit() {
    if (
      !this.workplace.wdf.starters.updatedSinceEffectiveDate ||
      !this.workplace.wdf.leavers.updatedSinceEffectiveDate ||
      !this.workplace.wdf.vacancies.updatedSinceEffectiveDate ||
      !this.workplace.wdf.numberOfStaff.updatedSinceEffectiveDate
    ) {
      const dialog = this.dialogService.open(WdfWorkplaceConfirmationDialogComponent, { workplace: this.workplace });
      dialog.afterClosed.subscribe(confirmed => {
        if (confirmed) {
          this.confirmAndSubmit();
        }
      });
    } else {
      this.confirmAndSubmit();
    }
  }

  /**
   * TODO: This does not do anything (awaiting on agreement with a 'save' on BE)
   */
  private confirmAndSubmit() {
    this.router.navigate(this.returnUrl.url);
    this.alertService.addAlert({ type: 'success', message: 'The workplace has been saved and confirmed.' });
  }

  get displayConfirmationPanel() {
    return this.workplace && this.workplace.wdf.currentEligibility && !this.workplace.wdf.isEligible;
  }
}
