import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  WdfWorkerConfirmationDialogComponent,
} from '../wdf-worker-confirmation-dialog/wdf-worker-confirmation-dialog.component';

@Component({
  selector: 'app-wdf-staff-summary',
  templateUrl: './wdf-staff-summary.component.html',
})
export class WdfStaffSummaryComponent implements OnInit {
  public worker: Worker;
  public workplace: Establishment;
  public isEligible: boolean;
  public exitUrl: URLStructure;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private dialogService: DialogService,
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show();

    this.workplace = this.establishmentService.establishment;

    this.workerService.getWorker(this.workplace.uid, this.route.snapshot.params.id, true).subscribe(worker => {
      this.worker = worker;
      this.isEligible = this.worker.wdf.isEligible && this.worker.wdf.currentEligibility;
      this.exitUrl = { url: ['/workplace', this.workplace.uid, 'reports', 'wdf'], fragment: 'staff-records' };
    });
  }

  /**
   * TODO: If daysSick and pay are `upToDate' we should skip the modal
   * Only display quesitons that need confirming on the modal itself.
   */
  public onConfirmAndSubmit() {
    const dialog = this.dialogService.open(WdfWorkerConfirmationDialogComponent, {
      daysSick: this.worker.daysSick,
      pay: this.worker.annualHourlyPay,
    });
    dialog.afterClosed.subscribe(confirmed => {
      if (confirmed) {
        this.confirmAndSubmit();
      }
    });
  }

  /**
   * TODO: This does not do anything (awaiting implementation of BE 'save')
   */
  private confirmAndSubmit() {
    this.subscriptions.add(
      this.workerService.updateWorker(this.workplace.uid, this.worker.uid, {}).subscribe(() => {
        this.goToWdfPage();
        this.alertService.addAlert({ type: 'success', message: 'The staff record has been saved and confirmed.' });
      })
    );
  }

  /**
   * TODO: Remove this method once solution to wdf records not updating until record is 'complete'
   */
  public saveAndComplete() {
    this.workerService
      .updateWorker(this.workplace.uid, this.worker.uid, {
        completed: true,
      })
      .pipe(take(1))
      .subscribe(() => this.goToWdfPage());
  }

  public goToWdfPage() {
    this.router.navigate(this.exitUrl.url, { fragment: this.exitUrl.fragment });
  }

  /**
   * TODO: Functionality not implemented
   * It should just be a case of uncommenting the return
   */
  get displayConfirmationPanel() {
    return false;
    // return this.worker.wdf.isEligible && !this.worker.wdf.currentEligibility;
  }
}
