import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';

<<<<<<< HEAD
<<<<<<< HEAD
=======
import { PermissionsService } from '@core/services/permissions/permissions.service';
import * as moment from 'moment';
>>>>>>> Removed Link
=======
import { PermissionsService } from '@core/services/permissions/permissions.service';
>>>>>>> Feature/training and qualifications home tab (#1683)

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

  constructor(private permissionsService: PermissionsService) {}

  public getWorkerTrainingAndQualificationsPath(worker: Worker) {
    const path = ['/workplace', this.workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }
  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
  }
}
