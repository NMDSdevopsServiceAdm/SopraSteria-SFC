import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { Eligibility } from '@core/model/wdf.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import {
  WdfWorkplaceConfirmationDialogComponent,
} from '@features/workplace/wdf-workplace-confirmation-dialog/wdf-workplace-confirmation-dialog.component';
import { isObject, pick, pickBy, sortBy } from 'lodash';
import * as moment from 'moment';
import { combineLatest, Subscription } from 'rxjs';
import { flatMap, take, tap } from 'rxjs/operators';

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
  public canViewWorker: boolean;
  public canEditEstablishment: boolean;

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
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    const workplaceUid = this.route.snapshot.params.establishmentuid;

    const breadcrumbConfig =
      workplaceUid === this.establishmentService.primaryWorkplace.uid
        ? JourneyType.REPORTS
        : JourneyType.SUBSIDIARY_REPORTS;

    this.breadcrumbService.show(breadcrumbConfig);

    this.canViewWorker = this.permissionsService.can(workplaceUid, 'canViewWorker');
    this.canEditEstablishment = this.permissionsService.can(workplaceUid, 'canEditEstablishment');
    this.returnUrl = { url: ['/reports', 'workplace', workplaceUid, 'wdf'] };
    this.exitUrl = { url: ['/reports'] };
    this.workerService.setReturnTo(null);

    this.subscriptions.add(
      combineLatest([
        this.establishmentService.getEstablishment(workplaceUid, true),
        this.reportService.getWDFReport(workplaceUid),
        this.workerService.getTotalStaffRecords(workplaceUid),
      ])
        .pipe(take(1))
        .subscribe(([workplace, report, totalStaffRecords]) => {
          this.report = report;
          this.workplace = workplace;
          this.establishmentService.setState(workplace);
          this.workerCount = totalStaffRecords;
        })
    );

    if (this.canViewWorker) {
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

  private confirmAndSubmit() {
    const wdfProperties = pickBy(this.workplace.wdf, isObject);
    const keys = Object.keys(
      pickBy(wdfProperties, (wdfProperty, key) => {
        if (wdfProperty.hasOwnProperty('updatedSinceEffectiveDate')) {
          return wdfProperty.isEligible === Eligibility.YES && !wdfProperty.updatedSinceEffectiveDate;
        }
        return false;
      })
    );
    const props = pick(this.workplace, keys);

    this.establishmentService
      .updateWorkplace(this.workplace.uid, props)
      .pipe(
        flatMap(() =>
          this.establishmentService
            .getEstablishment(this.workplace.uid, true)
            .pipe(tap(workplace => (this.workplace = workplace)))
        ),
        flatMap(() => this.reportService.getWDFReport(this.workplace.uid).pipe(tap(report => (this.report = report))))
      )
      .subscribe(() => {
        this.router.navigate(this.returnUrl.url);
        this.alertService.addAlert({ type: 'success', message: 'The workplace has been saved and confirmed.' });
      });
  }

  get displayConfirmationPanel(): boolean {
    if (!this.workplace) {
      return false;
    }

    if (!this.canEditEstablishment) {
      return false;
    }

    const effectiveFrom = moment(this.workplace.wdf.effectiveFrom);
    const lastEligibility = moment(this.workplace.wdf.lastEligibility);

    if (lastEligibility.isAfter(effectiveFrom)) {
      return false;
    }

    return true;
  }
}
