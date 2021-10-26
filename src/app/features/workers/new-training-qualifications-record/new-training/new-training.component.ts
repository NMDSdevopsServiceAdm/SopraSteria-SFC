import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
})
export class NewTrainingComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() trainingRecords: TrainingRecordCategory[];
  public canEditWorker: boolean;

  constructor(private permissionsService: PermissionsService, private trainingStatusService: TrainingStatusService) {}

  ngOnInit(): void {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }
}
