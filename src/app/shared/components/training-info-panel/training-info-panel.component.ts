import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-training-info-panel',
  templateUrl: './training-info-panel.component.html',
})
export class TrainingInfoPanelComponent {
  @Input() workplace: Establishment;
  @Input() totalExpiredTraining = 0;
  @Input() totalExpiringTraining = 0;
  @Input() totalMissingMandatoryTraining = 0;
}
