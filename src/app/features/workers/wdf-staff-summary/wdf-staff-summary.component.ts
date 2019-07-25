import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { WdfConfirmationDialogComponent } from '../wdf-confirmation-dialog/wdf-confirmation-dialog.component';

@Component({
  selector: 'app-wdf-staff-summary',
  templateUrl: './wdf-staff-summary.component.html',
})
export class WdfStaffSummaryComponent implements OnInit {
  public worker: Worker;
  public workplace: Establishment;
  public isEligible: boolean;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private dialogService: DialogService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.workplace = this.establishmentService.establishment;

    this.workerService.getWorker(this.route.snapshot.params.id).subscribe(worker => {
      this.worker = worker;
      this.isEligible = this.worker.wdf.isEligible && this.worker.wdf.currentEligibility;
    });
  }

  public onConfirmAndSubmit() {
    const dialog = this.dialogService.open(WdfConfirmationDialogComponent, {
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
   * TODO: This does not do anything
   */
  private confirmAndSubmit() {
    this.subscriptions.add(
      this.workerService.updateWorker(this.worker.uid, {}).subscribe(() => {
        this.goToWdfPage();
        this.alertService.addAlert({ type: 'success', message: 'The staff record has been saved and confirmed.' });
      })
    );
  }

  public exit() {
    this.goToWdfPage();
  }

  /**
   * TODO: Remove this method once solution to wdf records not updating until record is 'complete'
   */
  public saveAndComplete() {
    this.workerService
      .updateWorker(this.worker.uid, {
        completed: true,
      })
      .pipe(take(1))
      .subscribe(() => this.goToWdfPage());
  }

  public goToWdfPage() {
    this.router.navigate(['/workplace', this.workplace.uid, 'reports', 'wdf'], { fragment: 'staff-records' });
  }

  get displayConfirmButtons() {
    return this.worker.wdf.isEligible && !this.worker.wdf.currentEligibility;
  }
}
