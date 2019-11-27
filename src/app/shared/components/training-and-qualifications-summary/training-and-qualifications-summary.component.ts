import { Component, Input, OnInit } from '@angular/core';
import { Establishment, SortTrainingAndQualsOptions } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-training-and-qualifications-summary',
  templateUrl: './training-and-qualifications-summary.component.html',
})
export class TrainingAndQualificationsSummaryComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() wdfView = false;
  public canViewWorker: boolean;
  public workersData: Array<Worker>;
  public sortTrainingAndQualsOptions;
  public sortByDefault: string;

  constructor(private permissionsService: PermissionsService) {}

  public getWorkerTrainingAndQualificationsPath(worker: Worker) {
    const path = ['/workplace', this.workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }
  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.sortTrainingAndQualsOptions = SortTrainingAndQualsOptions;
    this.sortByDefault = '2_dsc'; //status column
    //sorting by default on Status column (expiredTrainingCount)
    this.sortByColumn(this.sortByDefault);
  }

  public sortByColumn(selectedColumn: any) {
    switch (selectedColumn) {
      case '0_asc': {
        this.workers = orderBy(this.workers, [worker => worker.nameOrId.toLowerCase()], ['asc']);
        break;
      }
      case '0_dsc': {
        this.workers = orderBy(this.workers, [worker => worker.nameOrId.toLowerCase()], ['desc']);
        break;
      }
      case '1_asc': {
        this.workers = orderBy(this.workers, [worker => worker.trainingCount + worker.qualificationCount], ['asc']);
        break;
      }
      case '1_dsc': {
        this.workers = orderBy(this.workers, [worker => worker.trainingCount + worker.qualificationCount], ['desc']);
        break;
      }
      case '2_asc': {
        this.workers = orderBy(this.workers, ['expiredTrainingCount', 'expiringTrainingCount'], ['asc', 'asc']);
        break;
      }
      case '2_dsc': {
        this.workers = orderBy(this.workers, ['expiredTrainingCount', 'expiringTrainingCount'], ['desc', 'desc']);
        break;
      }
      default: {
        this.workers = orderBy(this.workers, ['expiredTrainingCount', 'expiringTrainingCount'], ['desc', 'desc']);
        break;
      }
    }
  }
}
