import { Component, OnDestroy, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
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
  public trainingRecordCreated = false;
  public trainingRecordEdited = false;
  public trainingRecordDeleted = false;
  public qualificationCreated = false;
  public qualificationEdited = false;
  public qualificationDeleted = false;
  public returnToRecord: URLStructure;
  public returnToQuals: URLStructure;
  public worker: Worker;
  public reportDetails: {};
  public updatedDate: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
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

    this.trainingRecordCreated = this.workerService.getTrainingRecordCreated();
    this.trainingRecordEdited = this.workerService.getTrainingRecordEdited();
    this.subscriptions.add(
      this.workerService.trainingRecordDeleted$.subscribe(bool => {
        if (bool) {
          window.scrollTo(0, 0);
        }
        this.trainingRecordDeleted = bool;
      })
    );

    this.qualificationCreated = this.workerService.getQualificationCreated();
    this.qualificationEdited = this.workerService.getQualificationEdited();
    this.subscriptions.add(
      this.workerService.qualificationDeleted$.subscribe(bool => {
        if (bool) {
          window.scrollTo(0, 0);
        }
        this.qualificationDeleted = bool;
      })
    );

    this.setDate();
  }

  ngOnDestroy() {
    this.workerService.resetTrainingRecordCreated();
    this.workerService.resetTrainingRecordEdited();
    this.workerService.setTrainingRecordDeleted(false);
    this.workerService.resetQualificationCreated();
    this.workerService.resetQualificationEdited();
    this.workerService.setQualificationDeleted(false);
    this.subscriptions.unsubscribe();
  }

  setDate() {
    this.updatedDate = moment(this.worker.updated).format('LL');
  }

  deleteWorker(event) {
    event.preventDefault();
    this.dialogService.open(DeleteWorkerDialogComponent, this.worker);
  }

  closeTrainingCreatedAlert(event) {
    event.preventDefault();
    this.workerService.resetTrainingRecordCreated();
    this.trainingRecordCreated = false;
  }

  closeTrainingEditedAlert(event) {
    event.preventDefault();
    this.workerService.resetTrainingRecordEdited();
    this.trainingRecordEdited = false;
  }

  closeTrainingDeletedAlert(event) {
    event.preventDefault();
    this.workerService.setTrainingRecordDeleted(false);
  }

  closeQualificationCreatedAlert(event) {
    event.preventDefault();
    this.workerService.resetQualificationCreated();
    this.qualificationCreated = false;
  }

  closeQualificationEditedAlert(event) {
    event.preventDefault();
    this.workerService.resetQualificationEdited();
    this.qualificationEdited = false;
  }

  closeQualificationDeletedAlert(event) {
    event.preventDefault();
    this.workerService.setQualificationDeleted(false);
  }
}
