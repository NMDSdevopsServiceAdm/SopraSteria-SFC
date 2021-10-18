import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
})
export class TrainingComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() trainingRecords: TrainingRecordCategory[];
  public canEditWorker: boolean;

  constructor(
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
    private router: Router,
    private trainingStatusService: TrainingStatusService,
  ) {}

  ngOnInit() {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }
}
