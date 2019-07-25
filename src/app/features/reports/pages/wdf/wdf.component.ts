import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { ReportService } from '@core/services/report.service';
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
export class WdfComponent implements OnInit {
  public workplace: Establishment;
  public workers: Array<Worker>;
  public report: WDFReport;
  public returnUrl: URLStructure;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private reportService: ReportService,
    private workerService: WorkerService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.workplace = this.route.snapshot.parent.data.establishment;
    this.returnUrl = { url: ['/workplace', this.workplace.uid, 'reports', 'wdf'] };

    combineLatest(
      this.workerService.getAllWorkers(this.workplace.uid),
      this.reportService.getWDFReport(this.workplace.uid)
    )
      .pipe(take(1))
      .subscribe(([workers, report]) => {
        this.workers = sortBy(workers, ['wdfEligible']);
        this.report = report;
      });
  }

  public onConfirmAndSubmit() {
    const dialog = this.dialogService.open(WdfWorkplaceConfirmationDialogComponent, { workplace: this.workplace });
    dialog.afterClosed.subscribe(confirmed => {
      if (confirmed) {
        this.confirmAndSubmit();
      }
    });
  }

  /**
   * TODO: This does not do anything (awaiting on agreement with a 'save' on BE)
   */
  private confirmAndSubmit() {
    this.router.navigate(this.returnUrl.url);
    this.alertService.addAlert({ type: 'success', message: 'The workplace has been saved and confirmed.' });
  }

  /**
   * TODO: Functionality not implemented (confirmation button not displayed)
   */
  get displayConfirmationPanel() {
    return false;
  }
}
