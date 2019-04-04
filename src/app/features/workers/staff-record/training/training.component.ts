import { Component, Input, OnInit } from '@angular/core';
import { TrainingRecord } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { WorkerService } from '@core/services/worker.service';
import { DeleteTrainingDialogComponent } from '@features/workers/delete-training-dialog/delete-training-dialog.component';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
})
export class TrainingComponent implements OnInit {
  @Input() worker: Worker;
  public lastUpdated: moment.Moment;
  public trainingRecords: TrainingRecord[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(private workerService: WorkerService, private dialogService: DialogService) {}

  ngOnInit() {
    this.fetchAllRecords();
  }

  deleteTrainingRecord(trainingRecord: TrainingRecord, event) {
    event.preventDefault();
    const dialog = this.dialogService.open(DeleteTrainingDialogComponent, {
      nameOrId: this.worker.nameOrId,
      trainingRecord,
    });
    dialog.afterClosed.pipe(take(1)).subscribe(confirm => {
      if (confirm) {
        this.workerService.deleteTrainingRecord(this.worker.uid, trainingRecord.uid).subscribe(() => {
          this.workerService.setTrainingRecordDeleted(true);
          this.fetchAllRecords();
        });
      }
    });
  }

  fetchAllRecords() {
    this.subscriptions.add(
      this.workerService
        .getTrainingRecords(this.worker.uid)
        .pipe(take(1))
        .subscribe(training => {
          this.lastUpdated = moment(training.lastUpdated);
          this.trainingRecords = training.training;
        })
    );
  }
}
