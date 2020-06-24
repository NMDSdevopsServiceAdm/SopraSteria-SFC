import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Establishment, SortTrainingAndQualsOptionsWorker } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import orderBy from 'lodash/orderBy';

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
  public sortTrainingAndQualsOptions;
  public sortByDefault: string;
  constructor(
    private permissionsService: PermissionsService,
  ) {}
  public getWorkerTrainingAndQualificationsPath(worker: Worker) {
    const path = ['/workplace', this.workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }
  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.sortTrainingAndQualsOptions = SortTrainingAndQualsOptionsWorker;
    this.sortByDefault = '0_expired';
    this.orderWorkers(this.sortByDefault);
  }

  public orderWorkers(dropdownValue) {
    let sortValue: string;
    if (dropdownValue.includes('missing')) {
      sortValue = 'missingMandatoryTrainingCount';
    } else if (dropdownValue.includes('expired')) {
      sortValue = 'expiredTrainingCount';
    } else if (dropdownValue.includes('expires_soon')) {
      sortValue = 'expiringTrainingCount';
    }

    if (dropdownValue === 'worker') {
      this.workers = orderBy(
      this.workers,
      [ worker => worker.nameOrId.toLowerCase()],
      [ 'desc'],
    );
    } else {
      this.workers = orderBy(
        this.workers,
        [sortValue,  worker => worker.nameOrId.toLowerCase()],
        ['desc', 'asc'],
      );
    }
  }
}
