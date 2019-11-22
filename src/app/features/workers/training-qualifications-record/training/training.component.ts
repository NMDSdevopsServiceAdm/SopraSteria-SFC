import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecord } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { DeleteTrainingDialogComponent } from '@features/workers/delete-training-dialog/delete-training-dialog.component';
import * as moment from 'moment';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
})
export class TrainingComponent implements OnInit {
  @Input() worker: Worker;
  @Input() workplace: Establishment;
  public canEditWorker: boolean;
  public lastUpdated: moment.Moment;
  public trainingRecords: TrainingRecord[] = [];
  public trainingDetails = [];
  public trainingDetailsLabel = [];

  constructor(
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.fetchAllRecords();

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  deleteTrainingRecord(trainingRecord: TrainingRecord, event) {
    event.preventDefault();
    const dialog = this.dialogService.open(DeleteTrainingDialogComponent, {
      nameOrId: this.worker.nameOrId,
      trainingRecord,
    });
    dialog.afterClosed.pipe(take(1)).subscribe(confirm => {
      if (confirm) {
        this.workerService
          .deleteTrainingRecord(this.workplace.uid, this.worker.uid, trainingRecord.uid)
          .subscribe(() => {
            this.workerService.alert = { type: 'success', message: 'Training has been deleted' };
            this.fetchAllRecords();
          });
      }
    });
  }
  //to get all training records
  fetchAllRecords() {
    this.workerService
      .getTrainingRecords(this.workplace.uid, this.worker.uid)
      .pipe(take(1))
      .subscribe(
        training => {
          this.lastUpdated = moment(training.lastUpdated);
          this.trainingRecords = training.training;
          this.trainingRecords.map(trainingRecord => {
            trainingRecord.trainingStatus = this.getTrainingStatus(trainingRecord.expires);
          });
        },
        error => {
          console.error(error.error);
        }
      );
  }
  /**
   * Function used to get traingin status by comparing expiring date
   * @param {date} exptire date
   * @return {number} 0 for up-to-date, 1 for expiring soon and 2 for expired.
   */
  public getTrainingStatus(expires) {
    let status = 0;
    if (expires) {
      const expiringDate = moment(expires);
      const currentDate = moment();
      if (currentDate > expiringDate) {
        status = 2;
      } else if (expiringDate.diff(currentDate, 'days') <= 90) {
        status = 1;
      } else {
        status = 0;
      }
    }
    return status;
  }

  public toggleDetails(index: number, event) {
    event.preventDefault();
    this.trainingDetails[index] = !this.trainingDetails[index];
    this.trainingDetailsLabel[index] = this.trainingDetailsLabel[index] === 'Close' ? 'Open' : 'Close';
  }
}
