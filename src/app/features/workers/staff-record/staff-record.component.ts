import { Component, OnDestroy, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertsService } from '@core/services/alerts.service';
import { DialogService } from '@core/services/dialog.service';
import { ReportsService } from '@core/services/reports.service';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { DeleteWorkerDialogComponent } from '../delete-worker-dialog/delete-worker-dialog.component';

// TODO Remove CSS for delete button
@Component({
  selector: 'app-staff-record',
  templateUrl: './staff-record.component.html',
  styleUrls: ['./staff-record.component.scss'],
})
export class StaffRecordComponent implements OnInit, OnDestroy {
  public returnToRecord: URLStructure;
  public returnToQuals: URLStructure;
  public worker: Worker;
  public reportDetails: {};
  public updatedDate: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertsService: AlertsService,
    private dialogService: DialogService,
    private workerService: WorkerService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe(worker => {
        this.worker = worker;

        this.returnToRecord = { url: ['/worker', this.worker.uid], fragment: 'staff-record' };
        this.returnToQuals = { url: ['/worker', this.worker.uid], fragment: 'qualifications-and-training' };
      })
    );

    this.subscriptions.add(
      this.reportsService.reportDetails$.subscribe(reportDetails => (this.reportDetails = reportDetails))
    );

    if (this.reportDetails != null && this.reportDetails.hasOwnProperty('displayWDFReport')) {
      this.reportDetails['displayWDFReport'] = true;
    }

    this.subscriptions.add(
      this.workerService.alert$.subscribe(alert => {
        if (alert) {
          window.scrollTo(0, 0);
          this.alertsService.addAlert(alert);
        }
      })
    );

    this.setDate();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setDate() {
    this.updatedDate = moment(this.worker.updated).format('LL');
  }

  deleteWorker(event) {
    event.preventDefault();
    this.dialogService.open(DeleteWorkerDialogComponent, this.worker);
  }
}
