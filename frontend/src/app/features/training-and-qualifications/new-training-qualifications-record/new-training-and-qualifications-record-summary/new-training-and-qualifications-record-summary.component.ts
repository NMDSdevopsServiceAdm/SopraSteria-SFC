import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-new-training-and-qualifications-record-summary',
  templateUrl: './new-training-and-qualifications-record-summary.component.html',
  styleUrls: ['./new-training-and-qualifications-record-summary.component.scss'],
})
export class NewTrainingAndQualificationsRecordSummaryComponent {
  @Input() trainingCounts: number;
  @Input() qualificationsCount: number;
  @ViewChild('content') public content: ElementRef;
}
