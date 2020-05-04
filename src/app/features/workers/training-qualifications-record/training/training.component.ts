import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecord } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { DeleteTrainingDialogComponent } from '@features/workers/delete-training-dialog/delete-training-dialog.component';
import { orderBy } from 'lodash';
import * as moment from 'moment';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html'
})
export class TrainingComponent implements OnInit {
  @Input() worker: Worker;
  @Input() workplace: Establishment;
  @Output() trainingChanged: EventEmitter<boolean> = new EventEmitter();
  public canEditWorker: boolean;
  public lastUpdated: moment.Moment;
  public trainingRecords: TrainingRecord[] = [];
  public trainingDetails = [];
  public trainingDetailsLabel = [];
  public trainingCount = 0;

  constructor(
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
    private router: Router,
    private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.fetchAllRecords();

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  deleteTrainingRecord(trainingRecord: TrainingRecord, event) {
    event.preventDefault();
    const dialog = this.dialogService.open(DeleteTrainingDialogComponent, {
      nameOrId: this.worker.nameOrId,
      trainingRecord
    });
    dialog.afterClosed.pipe(take(1)).subscribe(confirm => {
      if (confirm) {
        this.workerService
          .deleteTrainingRecord(this.workplace.uid, this.worker.uid, trainingRecord.uid)
          .subscribe(() => {
            this.workerService.alert = { type: 'success', message: 'Training has been deleted.' };
            this.fetchAllRecords();
            this.trainingChanged.emit(true);
          });
      }
    });
  }

  // to get all training records
  fetchAllRecords() {
    this.workerService
      .getTrainingRecords(this.workplace.uid, this.worker.uid)
      .pipe(take(1))
      .subscribe(
        training => {
          this.lastUpdated = moment(training.lastUpdated);
          this.trainingRecords = training.training;
          this.trainingCount = training.count;
          this.trainingRecords.map(trainingRecord => {
            trainingRecord.trainingStatus = this.getTrainingStatus(trainingRecord.expires, trainingRecord.missing);
          });
          this.trainingRecords.sort((record1, record2) => {
            if (record1.trainingStatus > record2.trainingStatus) {
              return -1;
            }
            if (record1.trainingStatus < record2.trainingStatus) {
              return 1;
            }
            if (record1.trainingCategory.category > record2.trainingCategory.category) {
              return 1;
            }
            if (record1.trainingCategory.category < record2.trainingCategory.category) {
              return -1;
            }
            return 0;
          });
        },
        error => {
          console.error(error.error);
        }
      );

  }

  /**
   * Function used to get training status by comparing expiring date
   * @param {date} exptire date
   * @return {number} 0 for up-to-date, 1 for expiring soon , 2 for expired,3 for missing.
   */
  public getTrainingStatus(expires, missing) {
    let status = 0;
    if (expires) {
      const expiringDate = moment(expires);
      const currentDate = moment();
      const daysDiffrence = expiringDate.diff(currentDate, 'days');
      if (daysDiffrence < 0) {
        status = 2;
      } else if (daysDiffrence >= 0 && daysDiffrence <= 90) {
        status = 1;
      } else {
        status = 0;
      }
    } else if (missing) {
      status = 3;
    }
    return status;
  }

  /**
   * Function used to hadle toggle for traing details view and change training details lable
   * @param {string} training uid of clicked row
   * @param {event} refrance of event handler
   */
  public toggleDetails(uid: string, event) {
    event.preventDefault();
    this.trainingDetails[uid] = !this.trainingDetails[uid];
    this.trainingDetailsLabel[uid] = this.trainingDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

  public getRoute() {
    this.workerService.getRoute$.next(this.router.url);
  }
}
