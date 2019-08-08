import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { DeleteWorkerDialogComponent } from '../delete-worker-dialog/delete-worker-dialog.component';

@Component({
  selector: 'app-staff-record',
  templateUrl: './staff-record.component.html',
})
export class StaffRecordComponent implements OnInit, OnDestroy {
  public returnToRecord: URLStructure;
  public returnToQuals: URLStructure;
  public worker: Worker;
  public workplace: Establishment;

  public updatedDate: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private dialogService: DialogService,
    private workerService: WorkerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe(worker => {
        this.worker = worker;
        this.returnToRecord = {
          url: ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid],
          fragment: 'staff-record',
        };
        this.returnToQuals = {
          url: ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid],
          fragment: 'qualifications-and-training',
        };
      })
    );

    this.subscriptions.add(
      this.workerService.alert$.subscribe(alert => {
        if (alert) {
          this.alertService.addAlert(alert);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  deleteWorker(event) {
    event.preventDefault();
    this.dialogService.open(DeleteWorkerDialogComponent, {
      worker: this.worker,
      workplace: this.workplace,
      primaryWorkplaceUid: this.route.parent.snapshot.data.primaryWorkplace
        ? this.route.parent.snapshot.data.primaryWorkplace.uid
        : null,
    });
  }
}
