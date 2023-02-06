import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { MandatoryTraining } from '@core/model/training.model';

@Component({
  selector: 'app-missing-mandatory-training',
  templateUrl: './missing-mandatory-training.component.html',
})
export class MissingMandatoryTrainingComponent {
  public workplace: Establishment;
  @Input() public missingMandatoryTraining: MandatoryTraining[];
  @Input() public canEditWorker: boolean;

  public setLocalStorage(event: Event, category: string): void {
    event.preventDefault();
    const training = this.missingMandatoryTraining.find((missingTraining) => missingTraining.category === category);
    localStorage.setItem('trainingCategory', JSON.stringify(training));
  }
}
