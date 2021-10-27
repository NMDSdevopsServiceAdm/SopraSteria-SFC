import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
})
export class NewTrainingComponent implements OnInit {
  @Input() public workplace: Establishment;
  @Input() public trainingRecords: TrainingRecordCategory[];
  @Input() public trainingType: string;
  @Input() public setReturnRoute: () => void;
  public canEditWorker: boolean;

  constructor(
    private permissionsService: PermissionsService,
    private trainingStatusService: TrainingStatusService,
    private workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }
}
