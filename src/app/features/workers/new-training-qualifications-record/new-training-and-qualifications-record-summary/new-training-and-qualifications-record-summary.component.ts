import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-new-training-and-qualifications-record-summary',
  templateUrl: './new-training-and-qualifications-record-summary.component.html',
  styleUrls: ['./new-training-and-qualifications-record-summary.component.scss'],
})
export class NewTrainingAndQualificationsRecordSummaryComponent {
  @Input() trainingCount: number;
  @Input() qualificationsCount: number;
  @Input() expiresSoonTrainingCount: number;
  @Input() expiredTrainingCount: number;
}
