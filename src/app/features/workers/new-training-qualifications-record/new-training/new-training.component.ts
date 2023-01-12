import { Component, Input } from '@angular/core';
import { TrainingRecordCategory } from '@core/model/training.model';
import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
})
export class NewTrainingComponent {
  @Input() public trainingRecords: TrainingRecordCategory[];
  @Input() public trainingType: string;
  @Input() public canEditWorker: boolean;

  constructor(private trainingStatusService: TrainingStatusService) {}

  public setLocalStorage(event: Event, category: string): void {
    event.preventDefault();
    localStorage.setItem('trainingCategory', category);
  }
}
