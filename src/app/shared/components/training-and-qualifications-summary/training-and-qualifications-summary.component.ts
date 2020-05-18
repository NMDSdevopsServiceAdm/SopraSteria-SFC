import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Establishment, SortTrainingAndQualsOptions } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import orderBy from 'lodash/orderBy';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { int } from 'aws-sdk/clients/datapipeline';

@Component({
  selector: 'app-training-and-qualifications-summary',
  templateUrl: './training-and-qualifications-summary.component.html',
})
export class TrainingAndQualificationsSummaryComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() wdfView = false;

  @Input() showViewByToggle = false;

  @Output() viewTrainingByCategory: EventEmitter<boolean> = new EventEmitter();

  public canViewWorker: boolean;
  public workersData: Array<Worker>;
  public sortTrainingAndQualsOptions;
  public sortByDefault: string;
  constructor(
    private permissionsService: PermissionsService,
    protected trainingStatusService: TrainingStatusService
  ) {}
  public getWorkerTrainingAndQualificationsPath(worker: Worker) {
    const path = ['/workplace', this.workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }
  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.sortTrainingAndQualsOptions = SortTrainingAndQualsOptions;
    this.sortByDefault = 'expired';
    this.sortByStatus(this.sortByDefault);
  }

  public orderTrainingCategories(status) {
    let sortBy: number;
    switch (status) {
      case 'missing': {
        sortBy = this.trainingStatusService.MISSING;
        break;
      }
      case 'expired': {
        sortBy = this.trainingStatusService.EXPIRED;
        break;
      }
      case 'expiring_soon': {
        sortBy = this.trainingStatusService.EXPIRING
        break;
      }
    }
    this.workers = orderBy(
      this.trainingCategories,
      [
        (tc) => this.trainingStatusService.trainingStatusCount(tc.training, this.trainingStatusService.EXPIRED),
        (tc) => tc.category,
      ],
      ['desc', 'desc', 'desc', 'asc'],
    );
  }
  /**
   * Function used to sort traingin list based on selected column
   * @param {string} selected column key
   * @return {void}
   */
  public sortByStatus(selectedColumn: any) {
    switch (selectedColumn) {
      case '0_asc': {
        this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);
        break;
      }
      case '0_dsc': {
        this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['desc']);
        break;
      }
      case '1_asc': {
        this.workers = orderBy(this.workers, [(worker) => worker.trainingCount + worker.qualificationCount], ['asc']);
        break;
      }
      case '1_dsc': {
        this.workers = orderBy(this.workers, [(worker) => worker.trainingCount + worker.qualificationCount], ['desc']);
        break;
      }
      case '2_asc': {
        this.workers = orderBy(
          this.workers,
          ['expiredTrainingCount', 'expiringTrainingCount', 'missingMandatoryTrainingCount'],
          ['asc', 'asc', 'asc'],
        );
        break;
      }
      case '2_dsc': {
        this.workers = orderBy(
          this.workers,
          ['expiredTrainingCount', 'expiringTrainingCount', 'missingMandatoryTrainingCount'],
          ['desc', 'desc', 'desc'],
        );
        break;
      }
      default: {
        this.workers = orderBy(
          this.workers,
          ['expiredTrainingCount', 'expiringTrainingCount', 'missingMandatoryTrainingCount'],
          ['desc', 'desc', 'desc'],
        );
        break;
      }
    }
  }
}
