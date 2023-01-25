import { Component, Input } from '@angular/core';
import { TrainingRecordCategory } from '@core/model/training.model';
import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
})
export class NewTrainingComponent {
  @Input() public trainingCategories: TrainingRecordCategory[];
  @Input() public isMandatoryTraining = false;
  @Input() public trainingType: string;
  @Input() public setReturnRoute: () => void;
  @Input() public canEditWorker: boolean;

  constructor(protected trainingStatusService: TrainingStatusService) {}

  // @Input() public trainingRecords: TrainingRecordCategory[];
  // @Input() public canEditWorker: boolean;

  // constructor(private trainingStatusService: TrainingStatusService) {}

  // public setLocalStorage(event: Event, training: { id: number; category: string }): void {
  //   event.preventDefault();
  //   localStorage.setItem('trainingCategory', JSON.stringify(training));
  // }
}
