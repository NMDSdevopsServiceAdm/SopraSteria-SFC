import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Eligibility } from '@core/model/wdf.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { isObject, pick, pickBy } from 'lodash';
import { Subscription } from 'rxjs';

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
    this.breadcrumbService.show(JourneyType.REPORTS);

    this.workplace = this.establishmentService.establishment;

    this.workerService.getWorker(this.workplace.uid, this.route.snapshot.params.id, true).subscribe(worker => {
      this.worker = worker;
      this.isEligible = this.worker.wdf.isEligible && this.worker.wdf.currentEligibility;
      this.exitUrl = { url: ['/workplace', this.workplace.uid, 'reports', 'wdf'], fragment: 'staff-records' };
    });
  }

  public onConfirmAndSubmit() {
    const daysSickConfirm =
      this.worker.wdf.daysSick.isEligible !== Eligibility.NOT_RELEVANT &&
      !this.worker.wdf.daysSick.updatedSinceEffectiveDate;
    const annualHourlyPayConfirm =
      this.worker.wdf.annualHourlyPay.isEligible !== Eligibility.NOT_RELEVANT &&
      !this.worker.wdf.annualHourlyPay.updatedSinceEffectiveDate;

    if (daysSickConfirm || annualHourlyPayConfirm) {
      const dialog = this.dialogService.open(WdfWorkerConfirmationDialogComponent, {
        daysSick: daysSickConfirm ? this.worker.daysSick : null,
        pay: annualHourlyPayConfirm ? this.worker.annualHourlyPay : null,
      });
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
    const wdfProperties = pickBy(this.worker.wdf, isObject);
    const keys = Object.keys(
      pickBy(wdfProperties, (wdfProperty, key) => {
        if (wdfProperty.hasOwnProperty('updatedSinceEffectiveDate')) {
          return wdfProperty.isEligible === Eligibility.YES && !wdfProperty.updatedSinceEffectiveDate;
        }
        return false;
      })
    );
    const props = pick(this.worker, keys);

    this.subscriptions.add(
      this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(() => {
        this.router.navigate(this.exitUrl.url, { fragment: this.exitUrl.fragment });
        this.alertService.addAlert({ type: 'success', message: 'The staff record has been saved and confirmed.' });
      })
    );
  }

  get displayConfirmationPanel() {
    return this.worker.wdf.currentEligibility && !this.worker.wdf.isEligible;
  }
}
