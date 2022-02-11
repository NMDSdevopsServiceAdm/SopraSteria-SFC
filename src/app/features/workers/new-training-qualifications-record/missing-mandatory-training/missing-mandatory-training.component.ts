import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MandatoryTraining } from '@core/model/training.model';

@Component({
  selector: 'app-missing-mandatory-training',
  templateUrl: './missing-mandatory-training.component.html',
})
export class MissingMandatoryTrainingComponent {
  @Input() public missingMandatoryTraining: MandatoryTraining[];
  @Input() public canEditWorker: boolean;
  @Output() public addClicked: EventEmitter<void> = new EventEmitter();

  addButtonClicked(): void {
    this.addClicked.emit();
  }
}
