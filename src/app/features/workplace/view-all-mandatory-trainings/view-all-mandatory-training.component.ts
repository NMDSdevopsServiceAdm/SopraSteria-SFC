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
  @Input() wdfView = false;
  @Output() mandatoryTrainingChanged: EventEmitter<boolean> = new EventEmitter();
  public canEditWorker: boolean;
  public lastUpdated: moment.Moment;
  public mandatoryTrainings;
  public qualifications: Qualification[];
  public mandatoryTrainingsDetails = [];
  public mandatoryAllTrainingsDetails = [];
  public mandatoryTrainingsDetailsLabel = [];
  public establishmentId: number;
  public establishmentUid: string;
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
        this.establishmentUid = data.uid;
        this.canEditWorker = this.permissionsService.can(data.uid, 'canEditWorker');
        this.fetchAllRecords();
      }
    })
    );
  }

  public getWorkerRecordPath(worker: Worker) {
    const path = ['/workplace', this.establishmentUid, 'staff-record', worker.uid];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }

  fetchAllRecords() {
    this.subscriptions.add(
    this.workplaceService.getAllMandatoryTrainings(this.establishmentId).subscribe(data => {
       this.lastUpdated = moment(data.lastUpdated);
       this.mandatoryTrainings = data.mandatoryTraining;
      // console.log(groupBy(this.mandatoryTrainings, 'workers'))
       this.mandatoryTrainings.forEach(training => {
        let mandatoryTrainingObj = {
          id: '',
          category: '',
          status: '',
          quantity: '',
          workers: ''
          };
        let missingMandatoryTrainingCount = 0;
        mandatoryTrainingObj.id = training.id;
        mandatoryTrainingObj.category = training.category;
        mandatoryTrainingObj.quantity = training.workers.length;
        if (training.workers && training.workers.length > 0) {
          mandatoryTrainingObj.workers = training.workers;
          training.workers.forEach(worker => {
            missingMandatoryTrainingCount += worker.missingMandatoryTrainingCount;
          });
          if (missingMandatoryTrainingCount === 0) {
            mandatoryTrainingObj.status = 'Up-to-date';
          } else {
            mandatoryTrainingObj.status = `${missingMandatoryTrainingCount} Missing`;
          }
        } else {
          mandatoryTrainingObj.status = 'Up-to-date';
        }
        this.mandatoryTrainingsDetails.push(mandatoryTrainingObj);
       });
       this.mandatoryTrainings = this.mandatoryTrainingsDetails;
    })
    );
  }

  /**
   * Function used to hadle toggle for traing details view and change training details lable
   * @param {number} id of clicked row
   * @param {event} refrance of event handler
   */
  public toggleDetails(id: number, event) {
    event.preventDefault();
    this.mandatoryAllTrainingsDetails[id] = !this.mandatoryAllTrainingsDetails[id];
    this.mandatoryTrainingsDetailsLabel[id] = this.mandatoryTrainingsDetailsLabel[id] === 'Close' ? 'Open' : 'Close';
  }
  public getRoute() {
    this.workerService.getRoute$.next(this.router.url);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
