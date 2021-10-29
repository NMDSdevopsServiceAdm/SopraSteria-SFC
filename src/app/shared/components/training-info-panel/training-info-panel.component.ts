import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-training-info-panel',
  templateUrl: './training-info-panel.component.html',
  styleUrls: ['./training-info-panel.component.scss'],
})
export class TrainingInfoPanelComponent {
  @Input() totalExpiredTraining = 0;
  @Input() totalExpiringTraining = 0;
  @Input() totalMissingMandatoryTraining = 0;
}
