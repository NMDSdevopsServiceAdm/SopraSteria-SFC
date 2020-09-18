import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Qualification } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkplaceService } from '@core/services/workplace.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-all-mandatory-training',
  templateUrl: './view-all-mandatory-training.component.html',
})
export class ViewAllMandatoryTrainingComponent implements OnInit, OnDestroy {
  @Input() wdfView = false;
  public canEditWorker: boolean;
  public lastUpdated: moment.Moment;
  public mandatoryTrainings;
  public qualifications: Qualification[];
  public mandatoryTrainingsDetails = [];
  public mandatoryAllTrainingsDetails = [];
  public mandatoryTrainingsDetailsLabel = [];
  public establishmentId: number;
  public establishmentUid: string;
  public workplceName: string;
  public totalMissingMandatoryTrainingCount = 0;
  public totalExpiredTraining = 0;
  public totalExpiringTraining = 0;
  public totalMissingMandatoryTraining = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private workplaceService: WorkplaceService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.MANDATORY_TRAINING);
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((data) => {
        if (data && data.id) {
          this.establishmentId = data.id;
          this.establishmentUid = data.uid;
          this.workplceName = data.name;
          this.canEditWorker = this.permissionsService.can(data.uid, 'canEditWorker');
          this.fetchAllRecords();
        }
      }),
    );
  }

  public getWorkerRecordPath(worker: Worker) {
    const path = ['/workplace', this.establishmentUid, 'training-and-qualifications-record', worker.uid, 'training'];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }

  /**
   * Function will fetch all the workers mandatory training record.
   */

  public fetchAllRecords() {
    this.subscriptions.add(
      this.workplaceService.getAllMandatoryTrainings(this.establishmentId).subscribe((data) => {
        this.lastUpdated = moment(data.lastUpdated);
        this.mandatoryTrainings = data.mandatoryTraining;
        this.mandatoryTrainings.forEach((training) => {
          let mandatoryTrainingObj = {
            trainingCategoryId: '',
            category: '',
            status: '',
            quantity: '',
            workers: '',
            catMissingMandatoryTrainingCount: 0,
            catExpiredTrainingCount: 0,
            catExpiringTrainingCount: 0,
            catTrainingCount: 0,
            upToDateTrainingCount: 0,
          };

          mandatoryTrainingObj.trainingCategoryId = training.trainingCategoryId;
          mandatoryTrainingObj.category = training.category;
          mandatoryTrainingObj.quantity = training.workers.length;
          if (training.workers && training.workers.length > 0) {
            mandatoryTrainingObj.workers = training.workers;
            training.workers.forEach((worker) => {
              mandatoryTrainingObj.catMissingMandatoryTrainingCount += worker.missingMandatoryTrainingCount;
              mandatoryTrainingObj.catExpiredTrainingCount += worker.expiredTrainingCount;
              mandatoryTrainingObj.catExpiringTrainingCount += worker.expiringTrainingCount;
              mandatoryTrainingObj.catTrainingCount += worker.trainingCount;
              if (
                worker.missingMandatoryTrainingCount === 0 &&
                worker.expiredTrainingCount === 0 &&
                worker.expiringTrainingCount === 0
              ) {
                mandatoryTrainingObj.upToDateTrainingCount++;
              }
            });
          }
          this.totalExpiredTraining += mandatoryTrainingObj.catExpiredTrainingCount;
          this.totalExpiringTraining += mandatoryTrainingObj.catExpiringTrainingCount;
          this.totalMissingMandatoryTraining += mandatoryTrainingObj.catMissingMandatoryTrainingCount;
          this.mandatoryTrainingsDetails.push(mandatoryTrainingObj);
        });
        this.mandatoryTrainings = this.mandatoryTrainingsDetails;
      }),
    );
  }

  /**
   * Function used to handle toggle for worker details view and change the lable
   * @param {number} id of clicked row
   * @param {event} refrance of event handler
   */
  public toggleDetails(id: number, event) {
    event.preventDefault();
    this.mandatoryAllTrainingsDetails[id] = !this.mandatoryAllTrainingsDetails[id];
    this.mandatoryTrainingsDetailsLabel[id] = this.mandatoryTrainingsDetailsLabel[id] === 'Close' ? 'Open' : 'Close';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
