import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Qualification } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  DeleteQualificationDialogComponent,
} from '@features/workers/delete-qualification-dialog/delete-qualification-dialog.component';
import * as moment from 'moment';
import { take, groupBy } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { stringify } from 'querystring';

@Component({
  selector: 'app-view-all-mandatory-training',
  templateUrl: './view-all-mandatory-training.component.html',
})
export class ViewAllMandatoryTrainingComponent implements OnInit, OnDestroy {
  @Input() worker: Worker;
  @Input() workplace: Establishment;
  @Output() mandatoryTrainingChanged: EventEmitter<boolean> = new EventEmitter();
  public canEditWorker: boolean;
  public lastUpdated: moment.Moment;
  public mandatoryTrainings;
  public qualifications: Qualification[];
  public mandatoryTrainingsDetails = [];
  public qualificationDetailsLabel = [];
  public establishmentId: number;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private workplaceService: WorkplaceService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
    this.establishmentService.establishment$.subscribe(data => {
      if (data && data.id) {
        this.establishmentId = data.id;
        this.fetchAllRecords();
      }
    })
    );

  //  this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  // deleteQualification(record, event) {
  //   event.preventDefault();
  //   const dialog = this.dialogService.open(DeleteQualificationDialogComponent, {
  //     nameOrId: this.worker.nameOrId,
  //     record,
  //   });
  //   dialog.afterClosed.pipe(take(1)).subscribe(confirm => {
  //     if (confirm) {
  //       this.workerService.deleteQualification(this.workplace.uid, this.worker.uid, record.uid).subscribe(() => {
  //         this.workerService.alert = { type: 'success', message: 'Qualification has been deleted.' };
  //         this.fetchAllRecords();
  //         this.mandatoryTrainingChanged.emit(true);
  //       });
  //     }
  //   });
  // }

  fetchAllRecords() {
    this.subscriptions.add(
    this.workplaceService.getAllMandatoryTrainings(this.establishmentId).subscribe(data => {
       this.lastUpdated = moment(data.lastUpdated);
       this.mandatoryTrainings = data.mandatoryTraining;
      // console.log(groupBy(this.mandatoryTrainings, 'workers'))
       this.mandatoryTrainings.forEach(training => {
        let mandatoryTrainingObj = {
          category: '',
          status: '',
          quantity: '',
          workers: ''
          };
        let missingMandatoryTrainingCount = 0;
        mandatoryTrainingObj.category = training.category;
        mandatoryTrainingObj.quantity = training.workers.length;
        mandatoryTrainingObj.workers = training.workers;

        if (training.workers && training.workers.length > 0) {
          training.workers.forEach(worker => {
            missingMandatoryTrainingCount += worker.missingMandatoryTrainingCount;
          });
          if (missingMandatoryTrainingCount === 0) {
            mandatoryTrainingObj.status = 'Up-to-date';
          } else {
            mandatoryTrainingObj.status = `${missingMandatoryTrainingCount} Missing`;
          }
        }
        mandatoryTrainingObj.status = 'Up-to-date';
        this.mandatoryTrainingsDetails.push(mandatoryTrainingObj);
       });
       this.mandatoryTrainings = this.mandatoryTrainingsDetails;
    })
    );
  }

  /**
   * Function used to hadle toggle for traing details view and change training details lable
   * @param {string} qualification uid of clicked row
   * @param {event} refrance of event handler
   */
  // public toggleDetails(uid: string, event) {
  //   event.preventDefault();
  //   this.qualificationDetails[uid] = !this.qualificationDetails[uid];
  //   this.qualificationDetailsLabel[uid] = this.qualificationDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  // }
  public getRoute() {
    this.workerService.getRoute$.next(this.router.url);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
